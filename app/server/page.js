import { writeFile } from 'fs/promises';
import { join } from 'path';

export default function ServerUploadPage() {
    async function upload(data) {
        'use server'

        const file = data.get('file')

        if (!file) {
            throw new Error('No file uploaded')
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const path = join('/', 'tmp', file.name)
        await writeFile(path, buffer)
        console.log(`open ${path} to see the uploaded file`)
    }


    return (
        <main>
            <h1>
                Upload page???
            </h1>
            <form action={upload}>
                <input type="file" name="file" />
                <input type="submit" name="upload" />
            </form>
        </main>
    )
}