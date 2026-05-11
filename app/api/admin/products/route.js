import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';



// GET - Retrieve the Data
export async function GET(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    try {
        const pool = await getConnection();
        const result_categories = await pool.request().query('SELECT category_id, category_name as all_category FROM categories');
        const result_products = await pool.request().query('SELECT product_id, product_name, description, quantity, price, add_at, update_at FROM products');
        return NextResponse.json({
            categories: result_categories.recordset,
            products: result_products.recordset
        });
    } catch (error) {
        console.error('GET /api/admin/products error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Add new data to db
export async function POST(req) { // request(req) is the data from frontend
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

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

        if (body.imageUrl) {
            const request2 = pool.request()
            request2.input('product_id', newProductId)
            request2.input('image_url', body.imageUrl)
            await request2.query("INSERT INTO product_images (product_id, image_url) VALUES (@product_id, @image_url)")
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('POST /api/admin/products error:', error)
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

        await request.query('DELETE FROM product_images WHERE product_id = @product_id')
        await request.query('DELETE FROM products WHERE product_id = @product_id')

        await transaction.commit()

        return NextResponse.json({
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

    const request = await pool.request()

    if (body.Status == undefined) {
        request.input("ItemId", body.ItemId)
        request.input('List', body.List)
        request.input('update_at', body.timeUpdated)
        await request.query('UPDATE todo_item SET List = @List, update_at = GETDATE() WHERE ItemId = @ItemId')

        return NextResponse.json({
            success: 'Updated Successfully!'
        })
    }
    else {
        request.input("ItemId", body.ItemId)
        request.input('Status', body.Status)
        request.input('update_at', body.timeUpdated)
        
        await request.query('UPDATE todo_item SET Status = @Status, update_at = GETDATE() WHERE ItemId = @ItemId')

        return NextResponse.json({
        success: 'Updated Successfully!'
        })
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

