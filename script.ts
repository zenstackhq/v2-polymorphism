import { PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { inspect } from 'util';

const prisma = new PrismaClient({ log: ['info'] });

async function main() {
    await prisma.user.deleteMany();
    await prisma.content.deleteMany();

    const user = await prisma.user.create({ data: { id: 1 } });

    const db = enhance(
        prisma,
        { user: { id: user.id } },
        {
            kinds: ['delegate', 'policy'],
        }
    );

    const post = await db.post.create({
        data: { title: 'Post1' },
    });
    console.log('Post created:', inspect(post));

    const video = await db.video.create({
        data: { name: 'Video1', duration: 100 },
    });
    console.log('Video created:', inspect(video));

    console.log('All content:', inspect(await db.content.findMany()));
    console.log('All posts:', inspect(await db.post.findMany()));
    console.log('All videos:', inspect(await db.video.findMany()));

    await db.user.update({
        where: { id: user.id },
        data: {
            contents: { updateMany: { where: {}, data: { published: true } } },
        },
    });
    console.log(
        'All content after publish:',
        inspect(await db.content.findMany())
    );

    await db.content.deleteMany();
    console.log('All posts after delete:', inspect(await db.post.findMany()));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
