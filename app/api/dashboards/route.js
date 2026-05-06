import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { NextResponse } from 'next/server';
import jsonwebtoken, { verify } from 'jsonwebtoken';

// GET - Retrieve the Data
export async function GET(req) {
    // const user = verifyToken(req)
    // if (!user) {
    //     return NextResponse.json(
    //         {statusCode: 401},
    //         {status: 401}
    //     )
    // }
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get('userId');
    const pool = await getConnection();
    const request = pool.request();
    request.input('UserId', userId);
    const result = await request.query('SELECT COUNT(ItemId) as total_list FROM todo_item WHERE UserId = @userId')
    const result1 = await request.query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE UserId = @userId AND Status = 1')
    const result2 = await request.query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE UserId = @userId AND Status = 0')
    // console.log('Checking the db result of GET total list: ', result.recordset);
    return Response.json({
        result: result.recordset,
        result1: result1.recordset,
        result2: result2.recordset
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