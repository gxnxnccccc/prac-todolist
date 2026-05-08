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

    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    
    let result_totalUser, result_doneList, result_undoneList, result3, result_totalList
    if (!username) {
        result_totalUser = await request.query("SELECT COUNT(UserId) as total_user FROM todo_user WHERE Roles = 'user'")
        result_doneList = await request.query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE Status = 1')
        result_undoneList = await request.query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE Status = 0')
        result3 = await request.query('SELECT ItemId, List, Status, create_at FROM todo_item')
        result_totalList = await request.query('SELECT COUNT(ItemId) AS total_list FROM todo_item')
    }
    else {
        request.input('Username', sql.NVarChar, username)
        result_totalUser = await request.query("SELECT COUNT(UserId) as total_user FROM todo_user WHERE Username = @Username")
        result_doneList = await request.query('SELECT COUNT(ItemId) AS done_list FROM todo_item WHERE Status = 1 AND UserId = (SELECT UserId FROM todo_user WHERE Username = @Username)')
        result_undoneList = await request.query('SELECT COUNT(ItemId) AS undone_list FROM todo_item WHERE Status = 0 AND UserId = (SELECT UserId FROM todo_user WHERE Username = @Username)')
        result3 = await request.query('SELECT ItemId, List, Status, create_at FROM todo_item WHERE UserId = (SELECT UserId FROM todo_user WHERE Username = @Username)')
        result_totalList = await request.query('SELECT COUNT(ItemId) AS total_list FROM todo_item WHERE UserId = (SELECT UserId FROM todo_user WHERE Username = @Username)')
    }
    const result_allUsername = await request.query("SELECT Username as all_username FROM todo_user WHERE Roles = 'user'")

    return Response.json({
        result_totalUser: result_totalUser.recordset,
        result_doneList: result_doneList.recordset,
        result_undoneList: result_undoneList.recordset,
        result3: result3.recordset,
        result_totalList: result_totalList.recordset,
        result_allUsername: result_allUsername.recordset
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