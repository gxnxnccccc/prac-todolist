import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';
import sql from 'mssql';

export async function GET(req, ctx) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const { id } = await ctx.params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    try {
        const pool = await getConnection()
        const result = await pool.request()
            .input('userId', sql.Int, user.UserId)
            .input('orderId', sql.Int, numId)
            .query(`
                SELECT o.order_id, o.order_date, o.total_price,
                       op.order_product_id, op.buy_quantity, op.unit_price,
                       p.product_id, p.product_name, p.description,
                       (SELECT TOP 1 image_url FROM product_images WHERE product_id = p.product_id ORDER BY image_id) AS image_url
                FROM orders o
                LEFT JOIN order_products op ON o.order_id = op.order_id
                LEFT JOIN products p ON op.product_id = p.product_id
                WHERE o.user_id = @userId AND o.order_id = @orderId
            `)

        return NextResponse.json({ order_products: result.recordset })
    } catch (error) {
        console.error('GET /api/orders/[id] error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function verifyToken(req) {
    const auth = req.headers.get('Authorization')
    if (!auth) return null
    const token = auth.split(' ')[1]
    try {
        return jsonwebtoken.verify(token, process.env.JWT_SECRET)
    } catch {
        return null
    }
}
