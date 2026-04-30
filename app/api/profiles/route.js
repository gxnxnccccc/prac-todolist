import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import bcrypt from 'bcrypt';
import { join } from 'path';
import jsonwebtoken from 'jsonwebtoken';
import sql from 'mssql';
import { getConnection } from '@/lib/db';


function verifyToken(req) {
    const auth = req.headers.get('Authorization')
    if (!auth) return null
    const token = auth.split(' ')[1]
    try {
        return jsonwebtoken.verify(token, process.env.JWT_SECRET)
    } catch {
        return null
    }
}

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
    const result = await request.query('SELECT * FROM todo_user WHERE UserId = @userId');
    return Response.json(result.recordset);
}

export async function POST(request) {
    const user = verifyToken(request)
    // login or not
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const data = await request.formData()
    const file = data.get('file')
    const userId = data.get('userId')

    // have profile image or not
    if (!file) {
        return NextResponse.json({ success: false })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const now = new Date()
    const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
    const uniqueName = `${Date.now()}-${time}-${file.name}`

    const path = join(process.cwd(), 'public', 'uploads', uniqueName)
    await writeFile(path, buffer)

    const profileImagePath = `/uploads/${uniqueName}`

    if (userId) {
        const pool = await getConnection()
        const req = pool.request()

        // get the old path from db
        req.input('userId', userId)

        const result = await req.query('SELECT Profile_Image FROM todo_user WHERE UserId = @userId')
        const oldImg = result.recordset[0]?.Profile_Image // .Profile_Image is the db-col name

        // delete old image file
        if (oldImg) {
            const oldPath = join(process.cwd(), 'public', oldImg)
            try {
                await unlink(oldPath)
            } catch (error) {
                console.log('No old image file / Deleting old image unsuccessful.', error.message)
            }
        }

        // update db into new profile image path
        const req2 = pool.request()
        req2.input('userId', userId)
        req2.input('profileImage', userId)
        req.input('profileImage', profileImagePath)
        await req.query('UPDATE todo_user SET Profile_Image = @profileImage WHERE UserId = @userId')
    }

    return NextResponse.json({
        success: true,
        filename: uniqueName
    })
}

export async function PUT(req) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const { userId, oldPassword, newPassword } = await req.json()

    const pool = await getConnection()

    // 1. Fetch current hashed password from DB
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT Password FROM todo_user WHERE UserId = @userId')
    const hashedPassword = result.recordset[0]?.Password

    // 2. Compare old password against DB hash
    const match = await bcrypt.compare(oldPassword, hashedPassword)
    console.log("oldPassword received:", oldPassword)
    console.log("hashedPassword from DB:", hashedPassword)
    if (!match) {
        console.log("Old password is incorrect")
        return NextResponse.json({ statusCode: 401, message: "Old password is incorrect" }, { status: 401 })
    }

    // 3. Hash new password and update
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.request()
        .input('userId', userId)
        .input('newPassword', newHashedPassword)
        .query('UPDATE todo_user SET Password = @newPassword WHERE UserId = @userId')

    return NextResponse.json({ success: true })
}