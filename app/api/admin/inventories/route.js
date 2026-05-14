import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// GET - Retrieve the Data
export async function GET(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    try {
        const pool = await getConnection();
        const result_categories = await pool.request().query('SELECT category_id, category_name as all_category FROM categories');
        // const result_products = await pool.request().query(`
        //     SELECT p.product_id, p.product_name, p.description, p.quantity, p.price,
        //            p.add_at, p.update_at, pi.image_url, c.category_name
        //     FROM products p
        //     LEFT JOIN product_images pi ON p.product_id = pi.product_id
        //     LEFT JOIN categories c ON p.category_id = c.category_id
        // `);
        const result_products = await pool.request().query(`
            SELECT p.product_id, p.product_name, p.description, p.quantity, p.price,
                p.add_at, p.update_at, p.category_id, c.category_name,
                (SELECT TOP 1 image_url FROM product_images 
                    WHERE product_id = p.product_id ORDER BY image_id) AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
        `);
        const result_allImageProducts = await pool.request().query(`
            SELECT image_id, product_id, image_url FROM product_images ORDER BY product_id, image_id
        `);
        return NextResponse.json({
            categories: result_categories.recordset,
            products: result_products.recordset,
            all_images: result_allImageProducts.recordset
        });
    } catch (error) {
        console.error('GET /api/admin/inventories error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Add new data to db
export async function POST(req) { // request(req) is the data from frontend
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''

    // Image upload
    if (contentType.includes('multipart/form-data')) {
        try {
            const formData = await req.formData()
            const file = formData.get('file')
            if (!file) return NextResponse.json({ success: false })

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const now = new Date()
            const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
            const uniqueName = `${Date.now()}-${time}-${file.name}`
            const filePath = join(process.cwd(), 'public', 'productUploads', uniqueName)
            await writeFile(filePath, buffer)

            return NextResponse.json({ success: true, filename: uniqueName })
        } catch (error) {
            console.error('POST /api/admin/inventories image error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    }

    // Product creation
    try {
        const pool = await getConnection();
        const body = await req.json();
        console.log(body)

        const request = pool.request()
        request.input('product_name', body.productName)
        request.input('category_id', parseInt(body.categoryId))
        request.input('description', body.description)
        request.input('price', body.price)
        request.input('quantity', body.quantity)
        const result_products = await request.query("INSERT INTO products (product_name, category_id, description, price, quantity, add_at, update_at) OUTPUT INSERTED.product_id VALUES (@product_name, @category_id, @description, @price, @quantity, GETDATE(), GETDATE())");

        const newProductId = result_products.recordset[0].product_id

        if (body.imageUrl && body.imageUrl.length > 0) {
            for (const url of body.imageUrl) {
                const request2 = pool.request()
                request2.input('product_id', newProductId)
                request2.input('image_url', url)
                await request2.query("INSERT INTO product_images (product_id, image_url) VALUES (@product_id, @image_url)")
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('POST /api/admin/inventories error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const pool = await getConnection();
    const body = await req.json();
    const transaction = pool.transaction()
    
    try {
        await transaction.begin()

        const request = await transaction.request()
        request.input('product_id', body.product_id)

        let result
        if (body.image_id) {
            request.input('image_id', body.image_id)
            result = await request.query('DELETE FROM product_images WHERE product_id = @product_id AND image_id = @image_id')
        } else {
            await request.query('DELETE FROM product_images WHERE product_id = @product_id')
            result = await request.query('DELETE FROM products WHERE product_id = @product_id')
        }

        await transaction.commit()

        return NextResponse.json({
            result: result,
            success: 'Deleted!'
        })
    }
    catch (error) {
        await transaction.rollback()
        return NextResponse.json(
            { error: error.message},
            { statuscode: 500 }
        )
    }
}

export async function PUT(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const pool = await getConnection();
    const body = await req.json();

    const request = pool.request()
    request.input('product_id', body.product_id)
    request.input('product_name', body.productName)
    request.input('category_id', parseInt(body.categoryId))
    request.input('description', body.description)
    request.input('price', body.price)
    request.input('quantity', body.quantity)

    await request.query(`
        UPDATE products
        SET product_name = @product_name,
            category_id  = @category_id,
            description  = @description,
            price        = @price,
            quantity     = @quantity,
            update_at    = GETDATE()
        WHERE product_id = @product_id
    `)

    if (body.imageUrl && body.imageUrl.length > 0) {
        const delReq = pool.request()
        delReq.input('product_id', body.product_id)
        await delReq.query('DELETE FROM product_images WHERE product_id = @product_id')

        for (const url of body.imageUrl) {
            const insReq = pool.request()
            insReq.input('product_id', body.product_id)
            insReq.input('image_url', url)
            await insReq.query('INSERT INTO product_images (product_id, image_url) VALUES (@product_id, @image_url)')
        }
    }

    return NextResponse.json({ success: 'Updated Successfully!' })
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

