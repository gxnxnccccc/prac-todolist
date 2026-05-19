import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';
import sql from 'mssql';

export async function POST(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            { statusCode: 401 },
            { status: 401 }
        )
    }

    try {
        const body = await req.json()
        console.log("BODY: ", body)
        
        const pool = await getConnection();

        const orderItem = []
        let total = 0
        for (const item of body.items) {
            const result = await pool.request()
                .input('productId', item.product_id)
                .query(`SELECT price FROM products WHERE product_id = @productId`)
            
            const price = result.recordset[0].price
            total += price * item.buy_amount
            orderItem.push({...item, price})
        }

        const result_orders = await pool.request()
            .input('userId', user.UserId)
            .input('totalPrice', total)
            .query(`
                    INSERT INTO orders (user_id, total_price)
                    OUTPUT INSERTED.order_id
                    VALUES (@userId, @totalPrice)
                    `)
        const orderId = result_orders.recordset[0].order_id
        console.log("Here's the order ID: ", orderId)
        
        for (const item of orderItem) {
            console.log("cart_id to delete:", item.cart_id)
            await pool.request()
                .input('orderId', orderId)
                .input('productId', item.product_id)
                .input('buyAmount', item.buy_amount)
                .input('price', item.price)
                .query(`
                        INSERT INTO order_products (order_id, product_id, buy_amount, unit_price)
                        VALUES (@orderId, @productId, @buyAmount, @price)
                        `)

            await pool.request()
                .input('cartId', sql.Int, item.cart_id)
                .query(`DELETE FROM carts WHERE cart_id = @cartId`)
        }

        return NextResponse.json({
            order_id: orderId

        })
    }
    catch (error) {
        console.log('POST /api/orders error', error)
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