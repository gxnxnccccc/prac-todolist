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
    // const {searchParams} = new URL(req.url);
    // const userId = searchParams.get('userId');
    const pool = await getConnection();
    const request = pool.request();
    // request.input('UserId', userId);
    const result = await request.query('SELECT COUNT(UserId) as total_user FROM todo_user')
    const result1 = await request.query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE Status = 1')
    const result2 = await request.query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE Status = 0')
    const result3 = await request.query('SELECT ItemId, List, Status, create_at FROM todo_item')
    const result4 = await request.query('SELECT COUNT(ItemId) AS total_list FROM todo_item')
    return Response.json({
        result: result.recordset,
        result1: result1.recordset,
        result2: result2.recordset,
        result3: result3.recordset,
        result4: result4.recordset
    });
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