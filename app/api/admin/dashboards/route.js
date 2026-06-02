import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { NextResponse } from 'next/server';
import jsonwebtoken, { verify } from 'jsonwebtoken';

// GET - Retrieve the Data
export async function GET(req) {
    const admin = verifyToken(req)
    if (!admin) {
        return NextResponse.json(
            {statusCode: 401},
            {status: 401}
        )
    }

    const { searchParams } = new URL(req.url)
    const userId     = searchParams.get('user_id')
    const categoryId = searchParams.get('category_id')
    const productId  = searchParams.get('product_id')
    const day        = searchParams.get('day')

    try {
        const pool = await getConnection();

        let result_totalUser, result_doneList, result_undoneList, result3, result_totalList,
            result_totalProduct, result_totalCategory, result_totalOrderByDate

        if (!userId) { // query all (todo-item stats unfiltered)
            result_totalUser      = await pool.request().query("SELECT COUNT(UserId) as total_user FROM todo_user WHERE Roles = 'user'")
            result_doneList       = await pool.request().query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE Status = 1')
            result_undoneList     = await pool.request().query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE Status = 0')
            result3               = await pool.request().query('SELECT ItemId, List, Status, create_at FROM todo_item')
            result_totalList      = await pool.request().query('SELECT COUNT(ItemId) AS total_list FROM todo_item')
            result_totalCategory  = await pool.request().query('SELECT COUNT(category_id) AS total_category FROM categories')
            result_totalOrderByDate = await pool.request().query('SELECT COUNT(order_id) AS total_order FROM orders WHERE CAST(order_date AS DATE) = CAST(GETDATE() AS DATE)')
            if (categoryId) {
                result_totalProduct = await pool.request()
                    .input('CategoryId', sql.Int, categoryId)
                    .query('SELECT COUNT(product_id) AS total_product FROM products WHERE category_id = @CategoryId')
            } else {
                result_totalProduct = await pool.request().query('SELECT COUNT(product_id) AS total_product FROM products')
            }
        }
        else { // query todo-item stats filtered by user
            result_totalUser  = await pool.request()
                .input('UserId', sql.Int, userId)
                .query("SELECT COUNT(UserId) as total_user FROM todo_user WHERE UserId = @UserId")
            result_doneList   = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE Status = 1 AND UserId = @UserId')
            result_undoneList = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE Status = 0 AND UserId = @UserId')
            result3 = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT ItemId, List, Status, create_at FROM todo_item WHERE UserId = @UserId')
            result_totalList  = await pool.request()
                .input('UserId', sql.Int, userId)
                .query('SELECT COUNT(ItemId) AS total_list FROM todo_item WHERE UserId = @UserId')
        }

        // Always fetch category list so the dropdown is never emptied by filters
        const result_totalCategoryProduct = await pool.request()
            .query('SELECT category_id, category_name FROM categories')

        // Always fetch dropdown lists
        const result_allUsername = await pool.request()
            .query("SELECT UserId AS user_id, Username AS username FROM todo_user WHERE Roles = 'user'")
        const result_allProducts = await pool.request()
            .query('SELECT product_id, product_name FROM products ORDER BY product_name')

        // Dynamic total-order query — applies every active filter
        const orderReq   = pool.request()
        const conditions = []
        const joins      = []

        if (userId) {
            orderReq.input('UserId', sql.Int, userId)
            conditions.push('o.UserId = @UserId')
        }
        if (day) {
            orderReq.input('Day', sql.NVarChar, day)
            conditions.push('CAST(o.order_date AS DATE) = CAST(@Day AS DATE)')
        }
        if (productId || categoryId) {
            joins.push('JOIN order_products op ON o.order_id = op.order_id')
        }
        if (productId) {
            orderReq.input('ProductId', sql.Int, productId)
            conditions.push('op.product_id = @ProductId')
        }
        if (categoryId) {
            orderReq.input('CategoryId', sql.Int, categoryId)
            joins.push('JOIN products p ON op.product_id = p.product_id')
            conditions.push('p.category_id = @CategoryId')
        }

        let orderSql = 'SELECT COUNT(DISTINCT o.order_id) AS total_order FROM orders o'
        if (joins.length)      orderSql += ' ' + joins.join(' ')
        if (conditions.length) orderSql += ' WHERE ' + conditions.join(' AND ')

        const result_totalOrder = await orderReq.query(orderSql)

        // Order count grouped by day (same filters, for the graph)
        const orderTimeReq = pool.request()
        let orderTimeSql = 'SELECT CAST(o.order_date AS DATE) AS order_day, COUNT(DISTINCT o.order_id) AS total_order FROM orders o'
        if (joins.length) orderTimeSql += ' ' + joins.join(' ')
        if (conditions.length) orderTimeSql += ' WHERE ' + conditions.join(' AND ')
        orderTimeSql += ' GROUP BY CAST(o.order_date AS DATE) ORDER BY order_day'

        if (userId)     orderTimeReq.input('UserId',     sql.Int,      userId)
        if (day)        orderTimeReq.input('Day',        sql.NVarChar, day)
        if (productId)  orderTimeReq.input('ProductId',  sql.Int,      productId)
        if (categoryId) orderTimeReq.input('CategoryId', sql.Int,      categoryId)

        const result_orderOverTime = await orderTimeReq.query(orderTimeSql)

        return NextResponse.json({
            result_totalUser: result_totalUser.recordset,
            result_doneList: result_doneList.recordset,
            result_undoneList: result_undoneList.recordset,
            result3: result3.recordset,
            result_totalList: result_totalList.recordset,
            result_allUsername: result_allUsername.recordset,
            result_allProducts: result_allProducts.recordset,
            result_totalCategoryProduct: result_totalCategoryProduct.recordset,
            result_totalOrder: result_totalOrder.recordset,
            result_totalProduct: result_totalProduct?.recordset,
            result_totalCategory: result_totalCategory?.recordset,
            result_totalOrderByDate: result_totalOrderByDate?.recordset,
            result_orderOverTime: result_orderOverTime.recordset,
        });
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json({ error: 'Internal Server Error', detail: error.message }, { status: 500 })
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