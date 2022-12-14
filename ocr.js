const apikey = Deno.env.get('APIKEY');
const date = new Date();
const filename =
	`${date.getFullYear()
	}-${date.getMonth().toString().padStart(2,0)
	}-${date.getDate().toString().padStart(2,0)
	}-${date.getHours().toString().padStart(2,0)
	}-${date.getMinutes().toString().padStart(2,0)
	}-${(Math.random()+1).toString(36).slice(2, 5)}`;

const p = Deno.run({
	cmd: ['bash'],
	stdout: 'piped',
	stdin: 'piped',
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
await p.stdin.write( encoder.encode(
	`grim -g "$(slurp -b 00000055 -c 00ffff -w 2)" - > ${filename}.png`
));
await p.stdin.close();
await p.status();
p.close();

const body = new FormData;
body.append('file', new File([(await Deno.readFile(`${filename}.png`))], 'image.png', {type: 'image/png'}));
body.set('language', 'eng');
fetch('https://api.ocr.space/parse/image', {
	method: 'POST',
	headers: {
		'apikey': apikey
	},
	body,
})
	.then(res => res.json()).then(text => {
		Deno.writeTextFile(`${filename}.txt`, text.ParsedResults[0].ParsedText);
	}).catch(err => {
		console.error('Error: ', err);
	});

