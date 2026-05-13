import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import sql from 'mssql';

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
                SELECT p.product_id, p.product_name, p.description, p.quantity, p.price,
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
