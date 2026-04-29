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
    return Response.json(result.recordset);
}

// POST - Add new data to db
export async function POST(req) { // request(req) is the data from frontend
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const pool = await getConnection(); 
    const body = await req.json();  // convert list and userId datas (that originally json) to js for collecting
    console.log(body)
    


    const request = pool.request()
    request.input('List', body.List)
    request.input('UserId', body.UserId)
    await request.query('INSERT INTO todo_item (List, UserId, Status) VALUES (@list, @userId, 0)'); // Status 0 = Undone
    
    return NextResponse.json({
        success:'tested'
    })
}

export async function DELETE(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const pool = await getConnection();
    const body = await req.json();
    
    const request = await pool.request()
    request.input('ItemId', body.ItemId)
    await request.query('DELETE FROM todo_item WHERE ItemID = @ItemId')
    

    return NextResponse.json({
        success: 'Deleted!'
    })
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
        await request.query('UPDATE todo_item SET List = @List WHERE ItemId = @ItemId')

        return NextResponse.json({
            success: 'Updated Successfully!'
        })
    }
    else {
        request.input("ItemId", body.ItemId)
        request.input('Status', body.Status)
        await request.query('UPDATE todo_item SET Status = @Status WHERE ItemId = @ItemId')

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