import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { verify } from 'crypto';

export async function GET(req) {
    const user = verifyToken(req)
    // if (!user) {
    //     return NextResponse.json(
    //         { statusCode: 401 },
    //         { status: 401}
    //     )
    // }

    try {
        const pool = await getConnection();
        const result_categories = await pool.request().query('SELECT category_id, category_name as all_category FROM categories')
        const result_products = await pool.request().query(`
                SELECT p.product_id, p.product_name, p.description, p.quantity, p.price,
                p.add_at, p.update_at, p.category_id, c.category_name,
                (SELECT TOP 1 image_url FROM product_images 
                    WHERE product_id = p.product_id ORDER BY image_id) AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
                                                            `);
        const result_allImageProducts = await pool.request().query(`
                                                                    SELECT image_id, product_id, image_url
                                                                    FROM product_images
                                                                    ORDER BY product_id, image_id
                                                                    `);
        return NextResponse.json({
            categories: result_categories.recordset,
            products: result_products.recordset,
            all_images: result_allImageProducts.recordset
        });
    }
    catch (error) {
        console.error('GET /api/admin/products error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
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
