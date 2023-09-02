# SecretSecret: README

## Introduction

**secret**secret is a toy project, a service that allows you to share secrets with your colleagues in a secure but simple way. Your secrets **NEVER** leave your browser unencrypted.

Only the encrypted version is temporarily stored in a Redis cache. Assuming you choose password that is long and unique enough, it is impossible for me to decrypt the secret.

## How to Use

### Sending a secret

Visit service homepage, then:

1. Type the secret that you want to share
2. Type password used to encrypt your secret
3. You can modify default expiration and self-destruct options, or leave default values
4. Click 'encrypt'
5. Share the provided link and password used in step 2 with your team mates.

### Receiving a secret

1. Open the received secret**secret** link.
2. Type password you received from a person who gave you the link.
3. Click "decrypt" to see the secret.

## Self hosting

This app was built with Astro, Svelte and Vercel KV. You can fork this project and deploy your own version to Vercel in a matter of minutes, at almost zero cost.

### Receiving a Secret

1. Open the received SecretSecret link.
2. The secret will be decrypted in your browser and displayed to you.
3. The secret is deleted from our servers if the sender chose the "Auto delete after first read" option.

## FAQs

**Q: How secure is SecretSecret?**  
A: Thanks to client-side encryption, your secret never leaves your browser unencrypted, making it extremely secure.

**Q: What happens if the recipient doesn’t open the link?**  
A: The secret remains encrypted on our servers until it is read or until it expires. Links expire after at most 7 days.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
