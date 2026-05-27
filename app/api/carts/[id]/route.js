import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import sql from 'mssql';
import jsonwebtoken from 'jsonwebtoken';

export async function GET(req, ctx) {
    // user_id
    const user = verifyToken(req)
    console.log("User: ",user)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    //product_id 
    const { id } = await ctx.params 
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    try {
        const pool = await getConnection();

        const request = await pool.request()
        request.input('id', sql.Int, numId)
        request.input('user_id', sql.Int, user.UserId)
        
        const result_cart = await request.query(`
                                                SELECT p.product_id, p.product_name, c.cart_id, c.buy_quantity, cat.category_name, p.unit_price,
                                                (SELECT TOP 1 image_url FROM product_images WHERE product_id = p.product_id ORDER BY image_id) AS image_url
                                                FROM products p
                                                LEFT JOIN carts c ON p.product_id = c.product_id
                                                LEFT JOIN categories cat ON p.category_id = cat.category_id
                                                WHERE c.user_id = @user_id
                                                    `)
        
        return NextResponse.json({
            carts: result_cart.recordset
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

export async function PUT(req, {params}) {
    const { id } =  await params // product_id
    const numId = parseInt(id, 10)

    if (isNaN(numId)){
        return NextResponse.json(
            { error: 'Invalid ID'},
            { status: 400 }
        )
    }
    try {
        const decoded = verifyToken(req)

        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        const userId = decoded.UserId

        const body = await req.json()
        const pool = await getConnection();
        const request = await pool.request()

        request.input('cartId', sql.Int, body.cart_id)
        request.input('buyAmount', sql.Int, body.buy_quantity)
        request.input('user_id', sql.Int, userId)

        const result_updateCart = await request.query(`UPDATE carts
                                                      SET buy_quantity = @buyAmount
                                                      WHERE user_id = @user_id AND cart_id = @cartId
                                                    `)
        return NextResponse.json({
            updateCart: result_updateCart
        })
    }
    catch(error) {
        console.error('POST /api/products/[id] error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req, {params}) {
    const { id } =  await params // product_id
    const numId = parseInt(id, 10)

    if (isNaN(numId)){
        return NextResponse.json(
            { error: 'Invalid ID'},
            { status: 400 }
        )
    }
    try {
        const decoded = verifyToken(req)

        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        const userId = decoded.UserId

        const body = await req.json()
        const pool = await getConnection();
        const request = await pool.request()

        request.input('cartId', sql.Int, body.cart_id)
        request.input('buyAmount', sql.Int, body.buy_quantity)
        request.input('user_id', sql.Int, userId)

        const result_deleteCart = await request.query(`DELETE FROM carts
                                                      WHERE cart_id = @cartId AND user_id = @user_id
                                                    `)
        return NextResponse.json({
            deleteCart: result_deleteCart
        })
    }
    catch(error) {
        console.error('DELETE /api/products/[id] error:', error)
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