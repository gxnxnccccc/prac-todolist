import { getConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET
export async function GET(req, {params}) {
    const user = verifyToken(req)
    if (!user) {
        return NextResponse.json(
            {statusCode: 401},
            {status: 401}
        )
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const { id: productId } = await params // from [id]
    
    try {
        const pool = await getConnection();
        const request = pool.request()
        request.input('user_id', userId)
        request.input('product_id', productId)

        // user_id + product_id -- order review page
        const result_reviewByUser = await request.query(`
                                                            SELECT r.*, u.Username, u.Profile_Image, p.product_name
                                                            FROM reviews r
                                                            LEFT JOIN todo_user u ON r.user_id = u.UserId
                                                         LEFT JOIN products p ON r.product_id = p.product_id
                                                         WHERE r.product_id = @product_id AND r.user_id = @user_id
                                                        `);

        // product_id -- product/[id] page
        const request2 = pool.request()
        request2.input('product_id', productId)
        const result_resultByProduct = await request2.query(`
                                                                SELECT r.*, u.Username, u.Profile_Image, p.product_name
                                                                FROM reviews r
                                                                LEFT JOIN todo_user u ON r.user_id = u.UserId
                                                                LEFT JOIN products p ON r.product_id = p.product_id
                                                                WHERE r.product_id = @product_id
                                                            `);
        const request3 = pool.request()
        request3.input('product_id', productId)
        const result_avgRating = await request3.query(`
            SELECT CAST(AVG(CAST(star_rating AS DECIMAL(10,2))) AS DECIMAL(10,1)) AS average_rating
            FROM reviews
            WHERE product_id = @product_id
        `)

        return NextResponse.json({
            reviewByUser: result_reviewByUser.recordset,
            resultByProduct: result_resultByProduct.recordset,
            avgRating: result_avgRating.recordset[0]?.average_rating ?? null
        })
    }
    catch(error) {
        console.error('GET /api/reviews/[id] error: ', error)
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        )
    }
}

// POST
export async function POST(req) {
    const user = verifyToken(req)
    if (!user) return NextResponse.json(
        { statusCode: 401 },
        { status: 401 }
    )

    const contentType = req.headers.get('Content-type') || ''
    if (contentType.includes('multipart/form-data')) {
        try {
            const formData = await req.formData()

            const fileList = formData.getAll('files').filter(f => f && f.size > 0)

            const uploadDir = join(process.cwd(), 'public', 'reviewUploads')
            await mkdir(uploadDir, {recursive: true})

            const uploadedUrls = []
            for (const file of fileList) {
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const now = new Date()
                const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
                const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_')
                const uniqueName = `${Date.now()}-${time}-${safeName}`
                await writeFile(join(uploadDir, uniqueName), buffer)
                uploadedUrls.push(`/reviewUploads/${uniqueName}`)
            }

            const userId = formData.get('userId')
            const productId = formData.get('productId')
            const reviewComment = formData.get('reviewComment')

            const starRating = parseInt(formData.get('starRating'))
            if (!starRating || starRating < 1 || starRating > 5) {
                return NextResponse.json({ error: 'star_rating must be 1-5' }, { status: 400 })
            }

            const selectedLike = formData.get('selectedLike')


            const pool = await getConnection();
            
            const request = pool.request()
            request.input('user_id', userId)
            request.input('product_id', productId)
            request.input('star_rating', starRating)
            request.input('review_comment', reviewComment)
            request.input('review_img', JSON.stringify(uploadedUrls))
            request.input('selected_like', selectedLike)

            const result_reviews = await request.query("INSERT INTO reviews (user_id, product_id, star_rating, review_comment, review_img, review_date, like_select) VALUES (@user_id, @product_id, @star_rating, @review_comment, @review_img, GETDATE(), @selected_like)")

            return NextResponse.json({
                success: true,
                filenames: uploadedUrls,
                result_reviews: result_reviews
                })
        }
        catch(error) {
            console.error('POST /api/reviews/[id] image error: ', error)
            return NextResponse.json(
                {error: error.message},
                {status: 500}
            )
        }
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