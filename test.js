
const CLOUDFLARE_API_TOKEN = 'dO5lgiminsEVoYGiTI_EE7JTEirjMTDy2dzNOb3D';
const CLOUDFLARE_API_KEY = '206e62fa0d2d3b4e061b42ea8bb6f825de5f8';
const CLOUDFLARE_EMAIL = 'guptas3067@gmail.com';
const ZONE_ID = '3ef4f5708dfecf5e54fb6ed994390ba3';

async function createDNSRecord() {
    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,

            {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Email": CLOUDFLARE_EMAIL,
                    "X-Auth-Key": CLOUDFLARE_API_KEY,
                    // 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`

                }, body: JSON.stringify({

                    name: "example.com", // subdomain or domain
                    type: "A", // or CNAME
                    content: "198.51.100.4", // IP or hostname
                    ttl: 3600,
                    comment: "Domain verification record",
                    proxied: true,
                })
            },
        );
        const result = await response.json()
        console.log();


        console.log("Record created:", result);
    } catch (error) {
        console.error("Error creating record:", error);
    }
}

createDNSRecord();
