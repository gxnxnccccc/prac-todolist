import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import sql from 'mssql';
import jsonwebtoken from 'jsonwebtoken';

export async function GET(req, ctx) {
    const { id } = await ctx.params
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    try {
        const pool = await getConnection();

        const result_product = await pool.request()
            .input('id', sql.Int, numId)
            .query(`
                SELECT p.product_id, p.product_name, p.description, p.stock_quantity, p.unit_price,
                    p.add_at, p.update_at, p.category_id, c.category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.product_id = @id
            `)

        const result_images = await pool.request()
            .input('id', sql.Int, numId)
            .query(`
                SELECT image_url FROM product_images
                WHERE product_id = @id ORDER BY image_id
            `)

        if (result_product.recordset.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...result_product.recordset[0],
            images: result_images.recordset.map(r => r.image_url)
        })

    } catch (error) {
        console.error('GET /api/products/[id] error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req, {params}){
    const { id } = await params
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        const decoded = verifyToken(req)
        
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = decoded.UserId

        const body = await req.json()
        const pool = await getConnection();
        const request = await pool.request()

        request.input('productId', sql.Int, numId)
        request.input('buyAmount', sql.Int, body.quantity)
        request.input('user_id', sql.Int, userId)

        // const result_addToCart = await request.query("INSERT INTO carts (user_id, product_id, buy_quantity) VALUES (@user_id, @productId, @buyAmount)")
        const result_addToCart = await request.query(`
                                                        IF EXISTS (
                                                            SELECT 1 FROM carts
                                                            WHERE user_id = @user_id AND product_id = @productId
                                                        )
                                                            UPDATE carts
                                                            SET buy_quantity = buy_quantity + @buyAmount
                                                            WHERE user_id = @user_id AND product_id = @productId
                                                        ELSE
                                                            INSERT INTO carts (user_id, product_id, buy_quantity)
                                                            VALUES (@user_id, @productId, @buyAmount)
                                                    `)

        return NextResponse.json({
            addToCart: result_addToCart
        })
    }
    catch (error) {
        console.error('POST /api/products/[id] error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function verifyToken(req) {
    const auth = req.headers.get('Authorization')
    if (!auth) {
        return null
    }

    const token = auth.split(' ')[1]

    try {
        return jsonwebtoken.verify(token, process.env.JWT_SECRET)
    }
    catch (error) {
        console.log(error)
        return null
    }
        
}