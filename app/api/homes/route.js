import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';

// GET - Retrieve the Data
export async function GET(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const pool = await getConnection();
    const request = pool.request();
    request.input('userId', userId);
    const result = await request.query('SELECT * FROM todo_item WHERE UserId = @userId');

    console.log("Checking the DB result: ", result.recordset)

    return Response.json(result.recordset);
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