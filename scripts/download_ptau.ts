import fs from 'fs';
import https from 'https';
import path from 'path';

const url = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau";
const dest = path.join(process.cwd(), 'circuits/build/powersOfTau28_hez_final_12.ptau');
const dir = path.dirname(dest);

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const file = fs.createWriteStream(dest);

console.log(`Downloading ${url} to ${dest}...`);

https.get(url, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Redirecting to ${response.headers.location}`);
        https.get(response.headers.location!, (res2) => {
            res2.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log("Download complete.");
            });
        });
        return;
    }

    if (response.statusCode !== 200) {
        console.error(`Failed to download: ${response.statusCode}`);
        return;
    }

    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log("Download complete.");
    });
}).on('error', (err) => {
    fs.unlink(dest, () => { });
    console.error(err.message);
});
