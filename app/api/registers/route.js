import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// GET - Retrieve the Data
export async function GET() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM todo_user');
    return Response.json(result.recordset);
}

// POST - Add new data to db
export async function POST(req) {
    try {
        const pool = await getConnection();
        const body = await req.formData()

        const username = body.get('username')
        const password = body.get('password')
        const role = body.get('role')
        const file = body.get('file')

        const hashedPassword = await bcrypt.hash(password, 10)

        const request = pool.request()
        request.input('Username', username)
        request.input('Password', hashedPassword)
        request.input('Roles', role)

        let profileImagePath = null
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const now = new Date()
            const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
            const uniqueName = `${Date.now()}-${time}-${file.name}`
            const path = join(process.cwd(), 'public', 'uploads', uniqueName)
            await writeFile(path, buffer)
            profileImagePath = `/uploads/${uniqueName}`
        }

        request.input('Profile_Image', profileImagePath)
        await request.query('INSERT INTO todo_user (Username, Password, Profile_Image, Roles) VALUES (@Username, @Password, @Profile_Image, @Roles)');

        return NextResponse.json({ success: true })
    }
    catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ statusCode: 500 })
    }
}
