import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';



// GET - Retrieve the Data
export async function GET() {
    const pool = await getConnection(); // connect to db function
    const result = await pool.request().query('SELECT * FROM todo_user'); // query
    return Response.json(result.recordset); // shown as array from db
}

// POST - Add new data to db
export async function POST(req) { // request(req) is the data from frontend
    try {const pool = await getConnection(); 
    const body = await req.json();  // convert list and userId datas (that originally json) to js for collecting
    // console.log(body)

    const request = pool.request()
    request.input('Username', body.username)
    // request.input('Password', body.password)
    // const res = await request.query('SELECT UserId, Username, FROM todo_user WHERE Username=@Username and Password=@Password'); 
    
    const res = await request.query('SELECT UserId, Username, Password, Profile_Image, Roles FROM todo_user WHERE Username=@Username');
    console.log("Record: ", res.recordset.length)
    

    if (res.recordset.length === 0) {
        return NextResponse.json({ statusCode: 401 })
    }

    const match = await bcrypt.compare(body.password, res.recordset[0].Password) // compare password

    if (!match) {
        return NextResponse.json ({
            statusCode: 401
        })
    }

    // const token = jwt.sign(payload, secretKey)
    const token = jsonwebtoken.sign({ UserId: res.recordset[0].UserId, Username: res.recordset[0].Username }, process.env.JWT_SECRET)

    return NextResponse.json({
        user: res.recordset[0],
        token
        })
    }
    catch (error) {
        return NextResponse.json({
        statusCode: 500
        })
    }

    // if (res.username !== '') {
    //     console.log(res)
    // }
    // else {
    //     console.log("Incorrect")
    // }

    // if (res.recordset.length > 0) {
    //     // response.statusCode = 200;
    //     console.log("Login Successfully!")
    //     // console.log(res)
    // }
    // else {
    //     // response.statusCode = 401;
    //     console.log("Login Failed....")
    //     // console.log("Incorrect")

    //     return NextResponse.json({
    //     statusCode: 401
    //     })
    // }
}