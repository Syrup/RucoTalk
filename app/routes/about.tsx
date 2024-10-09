import { Link } from "@remix-run/react";

export default function About() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">
        Halo! Semoga kalian tetap baik-baik saja. RucoTalk (Ruang curhat online)
        adalah platform obrolan bebas atau forum diskusi yang memungkinkan
        pengguna untuk berbagi masalah dan mencari solusi masalah yang sedang
        kalian alami. Kami akan merespon anda secepat mungkin dengan orang-orang
        yang berpengalaman di bidangnya dan dapat dipastikan mereka bukanlah
        robot atau AI.
      </p>
      <p className="mb-4">
        Kami menjamin bahwa semua informasi yang anda berikan kepada kami akan
        kami jaga kerahasiaannya. Kami tidak akan pernah membagikan informasi
        anda kepada pihak ketiga tanpa izin anda.
      </p>
      <p className="mb-4">
        Jika anda memiliki pertanyaan lebih lanjut, jangan ragu untuk
        menghubungi kami melalui email kami di{" "}
        <a href="mailto:pik-r@sxrup.xyz">pik.r@sxrup.xyz</a>. <br />
        Atau anda juga bisa membuka forum diskusi kami di{" "}
        <Link to="/threads/new">sini</Link>.
      </p>
      <p className="mb-4">
        Terimakasih telah percaya kepada kami. Salam hangat, Tim RucoTalk.
      </p>
    </div>
  );
}
