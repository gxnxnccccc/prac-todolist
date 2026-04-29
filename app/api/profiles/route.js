import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
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
    if (!user) {
        return NextResponse.json({ statusCode: 401 }, { status: 401 })
    }

    const data = await request.formData()
    const file = data.get('file')
    const userId = data.get('userId')

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
        req.input('userId', userId)
        req.input('profileImage', profileImagePath)
        await req.query('UPDATE todo_user SET Profile_Image = @profileImage WHERE UserId = @userId')
    }

    return NextResponse.json({
        success: true,
        filename: uniqueName
    })
}