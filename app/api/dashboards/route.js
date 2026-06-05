import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { NextResponse } from 'next/server';
import jsonwebtoken, { verify } from 'jsonwebtoken';

// GET - Retrieve the Data
export async function GET(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            {statusCode: 401},
            {status: 401}
        )
    }
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get('userId');
    const pool = await getConnection();
    const request = pool.request();
    request.input('UserId', userId);
    const result_totalList = await request.query('SELECT COUNT(ItemId) as total_list FROM todo_item WHERE UserId = @userId')
    const result_doneList = await request.query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE UserId = @userId AND Status = 1')
    const result_undoneList = await request.query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE UserId = @UserId AND Status = 0')
    const result3 = await request.query('SELECT ItemId, List, Status, create_at FROM todo_item WHERE UserId = @userId')
    // console.log('Checking the db result of GET total list: ', result.recordset);
    return Response.json({
        result_totalList: result_totalList.recordset,
        result_doneList: result_doneList.recordset,
        result_undoneList: result_undoneList.recordset,
        result3: result3.recordset
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