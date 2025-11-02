# SecretSecret: README

## Introduction

**secret**secret is a toy project, a service that allows you to share secrets with your colleagues in a secure but simple way. Your secrets **NEVER** leave your browser unencrypted.

Only the encrypted version is temporarily stored in a Redis cache. Assuming you choose password that is long and unique enough, it is impossible for me to decrypt the secret.

## How to Use

### Sending a secret

Visit service homepage, then:

1. Type the secret that you want to share
2. Optionally attach files using the "Attach Files" button or drag & drop them
3. A password is auto-generated for you, but you can customize it if needed
4. You can modify default expiration, self-destruct, and single-click access options
5. Click 'Encrypt'
6. Share the provided link (and password if not using one-click mode) with your recipients

### Receiving a secret

1. Open the received secretsecret link
2. If using one-click mode, the secret will decrypt automatically. Otherwise, enter the password you received
3. Click "Decrypt" to see the secret and download any attached files

## Self hosting

This app was built with Astro, Svelte and Vercel KV. You can fork this project and deploy your own version to Vercel in a matter of minutes, at almost zero cost.

## FAQs

**Q: How secure is SecretSecret?**  
A: Thanks to client-side encryption, your secret never leaves your browser unencrypted, making it extremely secure.

**Q: What happens if the recipient doesn’t open the link?**  
A: The secret remains encrypted on our servers until it is read or until it expires. Links expire after at most 7 days.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
