import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';

export async function GET(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            { statusCode: 401 },
            { status: 401}
        )
    }

    try {
        const pool = await getConnection();
        const result_categories = await pool.request().query('SELECT category_id, category_name as all_category FROM categories')
        const result_products = await pool.request().query(`
                SELECT p.product_id, p.product_name, p.description, p.stock_quantity, p.unit_price,
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
        const result_wishlists = await pool.request()
                                                    .input('userId', user.UserId)
                                                    .query(`
                                                        SELECT *
                                                        FROM wishlists
                                                        WHERE user_id = @userId
                                                    `)
                
        return NextResponse.json({
            categories: result_categories.recordset,
            products: result_products.recordset,
            all_images: result_allImageProducts.recordset,
            wishlists: result_wishlists.recordset
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

export async function POST(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            { statusCode: 401 },
            { status: 401}
        )
    }
    
    try {
        const body = await req.json()
        const pool = await getConnection();
        const result_addWishlists = await pool.request()
            .input('userId', user.UserId)
            .input('productId', body.product_id)
            .query(`
                    INSERT INTO wishlists (user_id, product_id)
                    VALUES (@userId, @productId)
                    `)
        return NextResponse.json({ 
            addWishlists: result_addWishlists 
        })
    }
    catch (error) {
        console.error('POST /api/products_wishlists error', error)
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        )
    }
}

export async function DELETE(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            { statusCode: 401 },
            { status: 401}
        )
    }
    
    try {
        const body = await req.json()
        const pool = await getConnection();
        const result_removeWishlists = await pool.request()
            .input('userId', user.UserId)
            .input('productId', body.product_id)
            .query(`
                    DELETE FROM wishlists
                    WHERE user_id = @userId AND product_id = @productId
                    `)
        return NextResponse.json({ 
            removeWishlists: result_removeWishlists 
        })
    }
    catch (error) {
        console.error('DELETE /api/products_wishlists error', error)
        return NextResponse.json(
            {error: error.message},
            {status: 500}
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
