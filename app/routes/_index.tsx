import {
  json,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
  type ActionFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { jwtDecode } from "jwt-decode";
import { login } from "~/.server/cookies";
import type { LoginCookie, User } from "~/types";
import { Session } from "~/.server/sessions";
import { Button } from "~/components/ui/button";
import { mail } from "~/.server/utils";
import { client } from "~/.server/redis";

const isTokenExpired = (token: string) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp! < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "RucoTalk: Ceritakan Masalahmu" },
    { name: "description", content: "Ceritakan masalahmu disini!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs): Promise<
  TypedResponse<{
    isLoggedIn: boolean;
    user: User;
    cookie: LoginCookie;
    expired: number;
  }>
> {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };
  const { getSession } = await Session;
  const session = await getSession(cookieHeader);

  // mail.sendMail({
  //   from: '"PIK R" <pik.r@sxrup.xyz>',
  //   to: "goodgamersz665@gmail.com",
  //   subject: "Hello",
  //   text: "Hello world?",
  //   html: "<b>Hello world?</b>",
  // });

  // console.log(cookie);

  return json({
    isLoggedIn: !isTokenExpired(session.get("token")),
    user: cookie.user,
    cookie,
    expired: cookie.expired,
  });
}

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await login.parse(cookieHeader)) ?? { isLoggedIn: false };

  if (!cookie.isLoggedIn) {
    cookie.isLoggedIn = false;
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await login.serialize(cookie),
    },
  });
};

function Logged() {
  const { user, cookie } = useLoaderData<typeof loader>();
  const quotes = [
    "Hal yang paling penting adalah menikmati hidupmu, menjadi bahagia, apapun yang terjadi.",
    "Hidup itu sederhana, kita yang membuatnya sulit.",
    "Hidup itu bukan soal menemukan diri Anda sendiri, hidup itu membuat diri Anda sendiri.",
    "Hidup adalah mimpi bagi mereka yang bijaksana, permainan bagi mereka yang bodoh, komedi bagi mereka yang kaya, dan tragedi bagi mereka yang miskin.",
    "Kenyataannya, ada tidak tahu apa yang akan terjadi besok. Hidup adalah pengendaraan yang gila dan tidak ada yang menjaminnya.",
    "Tujuan hidup kita adalah menjadi bahagia.",
    "Hidup yang baik adalah hidup yang diinspirasi oleh cinta dan dipandu oleh ilmu pengetahuan.",
    "Hidup adalah serangkaian perubahan yang alami dan spontan. Jangan tolak mereka karena itu hanya membuat penyesalan dan duka. Biarkan realita menjadi realita. Biarkan sesuatu mengalir dengan alami ke manapun mereka suka.",
    "Anda di sini hanya untuk persinggahan yang singkat. Jangan terburu, jangan khawatir. Yakinlah bahwa Anda menghirup wangi bunga sepanjang perjalanan.",
    "Hidup adalah cermin dan akan merefleksikan kembali kepada para pemikir mengenai apa yang mereka pikirkan.",
    "Saya memiliki filosofi yang sederhana: isi apa yang kosong, kosongkan apa yang terlalu penuh.",
    "Kehidupan adalah 10 persen apa yang terjadi pada Anda dan 90 persen adalah bagaimana Anda meresponnya",
    "Satu-satunya keterbatasan dalam hidup adalah perilaku yang buruk.",
    "Seseorang yang berani membuang satu jam waktunya tidak mengetahui nilai dari kehidupan.",
    "Apa yang kita pikirkan menentukan apa yang akan terjadi pada kita. Jadi jika kita ingin mengubah hidup kita, kita perlu sedikit mengubah pikiran kita.",
    "Ia yang mengerjakan lebih dari apa yang dibayar pada suatu saat akan dibayar lebih dari apa yang ia kerjakan",
    "Satu-satunya sumber pengetahuan adalah pengalaman",
    "Saya selalu mencoba untuk mengubah kemalangan menjadi kesempatan",
    "Perjalanan 1000 mil dimulai dengan satu langkah kaki",
    "Seseorang yang pernah melakukan kesalahan dan tidak pernah memperbaikinya berarti Ia telah melakukan satu kesalahan lagi.",
    "Beberapa orang memimpikan kesuksesannya, sementara yang lainnya bangun setiap pagi untuk mewujudkan mimpinya",
    "Tidak ada perjuangan yang dilakukan tanpa rasa sakit, namun Anda harus percaya bahwa rasa sakit itu hanya sesaat saja dan akan diganti dengan kebahagiaan",
    "Anda seringkali lupa terhadap apa saja yang sudah dimiliki, tetapi selalu mengingat apa yang dimiliki orang lain",
    "Anda tidak akan pernah belajar sabar dan berani jika di dunia ini hanya ada kebahagiaan",
    "Maafkanlah sikap Anda ketika mengalami kegagalan dalam meraih mimpi dan percayalah akan ada mimpi lain yang lebih besar dan lebih baik dari mimpi Anda yang sudah dirancang sebelumnya",
    "Masa depan adalah milik Anda yang telah menyiapkannya dari hari ini",
    "Sekecil apapun nominalnya, uang akan cukup jika digunakan untuk HIDUP. Namun, sebesar apapun nominalnya, uang tidak akan pernah cukup jika digunakan untuk memenuhi GAYA HIDUP",
    "Kesabaran adalah obat terbaik untuk segala kesulitan",
    "Kedewasaan tidak dilihat dari usia, tetapi dilihat dari sikap dan tingkah laku",
    "Percaya diri adalah rahasia nomor satu dari kesuksesan",
    "Jika kapal Anda tidak kunjung datang maka berenanglah",
    "Kemanapun Anda pergi, lakukanlah segalanya dengan segenap hati.",
    "Bertambahnya usia bukan berarti kita memahami segalanya",
    "Keraguan membunuh lebih banyak harapan daripada kegagalan",
    "Siapapun bisa jadi apapun!",
    "Kata-kata Anda menunjukkan kualitas diri Anda",
    "Hati memiliki nalarnya sendiri, tetapi nalar tidak memiliki hati",
    "Majulah tanpa menyingkirkan orang lain. Naiklah tanpa menjatuhkan orang lain",
    "Pamer adalah ide yang bodoh untuk sebuah kemenangan",
    "Jika hanya mencari kesempurnaan, maka Anda tidak akan pernah tenang",
    "Hanya Saya yang dapat mengubah hidup Saya, tidak ada orang lain yang bisa melakukannya untuk Saya",
    "Bersyukurlah atas semua hal yang dimiliki sekarang karena Anda tidak pernah tahu kapan akan kehilangannya",
    'Hidup itu bukan tentang memiliki dan mendapatkan, tetapi tentang memberi serta menjadi "sesuatu"',
    "Jangan takut jika Anda berjalan lambat, takutlah jika hanya berdiam",
    "Terkadang Anda diuji bukan untuk menunjukkan kelemahan yang dimiliki, tetapi diuji untuk menemukan kekuatan yang ada di dalam diri",
    "Kita sibuk mencari yang sempurna, sampai-sampai melewatkan yang siap menerima apa adanya",
    "Beri nilai dari usahanya, bukan dari hasilnya. Baru Anda bisa menilai kehidupan",
  ];

  return (
    <div className="p-4 font-sans">
      <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Halo, {user.username}
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Sudahkah anda bercerita? Jika belum, jangan ragu untuk bercerita kepada
        kami. :)
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Ini ada kata-kata dari kami untuk kamu :)
      </p>
      <blockquote className="mt-6 border-l-2 pl-6 italic border-l-slate-700 text-muted-foreground">
        "{quotes[Math.floor(Math.random() * quotes.length)]}"
      </blockquote>
    </div>
  );
}

function NotLogged() {
  const quotes = [
    "Hal yang paling penting adalah menikmati hidupmu, menjadi bahagia, apapun yang terjadi.",
    "Hidup itu sederhana, kita yang membuatnya sulit.",
    "Hidup itu bukan soal menemukan diri Anda sendiri, hidup itu membuat diri Anda sendiri.",
    "Hidup adalah mimpi bagi mereka yang bijaksana, permainan bagi mereka yang bodoh, komedi bagi mereka yang kaya, dan tragedi bagi mereka yang miskin.",
    "Kenyataannya, ada tidak tahu apa yang akan terjadi besok. Hidup adalah pengendaraan yang gila dan tidak ada yang menjaminnya.",
    "Tujuan hidup kita adalah menjadi bahagia.",
    "Hidup yang baik adalah hidup yang diinspirasi oleh cinta dan dipandu oleh ilmu pengetahuan.",
    "Hidup adalah serangkaian perubahan yang alami dan spontan. Jangan tolak mereka karena itu hanya membuat penyesalan dan duka. Biarkan realita menjadi realita. Biarkan sesuatu mengalir dengan alami ke manapun mereka suka.",
    "Anda di sini hanya untuk persinggahan yang singkat. Jangan terburu, jangan khawatir. Yakinlah bahwa Anda menghirup wangi bunga sepanjang perjalanan.",
    "Hidup adalah cermin dan akan merefleksikan kembali kepada para pemikir mengenai apa yang mereka pikirkan.",
    "Saya memiliki filosofi yang sederhana: isi apa yang kosong, kosongkan apa yang terlalu penuh.",
    "Kehidupan adalah 10 persen apa yang terjadi pada Anda dan 90 persen adalah bagaimana Anda meresponnya",
    "Satu-satunya keterbatasan dalam hidup adalah perilaku yang buruk.",
    "Seseorang yang berani membuang satu jam waktunya tidak mengetahui nilai dari kehidupan.",
    "Apa yang kita pikirkan menentukan apa yang akan terjadi pada kita. Jadi jika kita ingin mengubah hidup kita, kita perlu sedikit mengubah pikiran kita.",
    "Ia yang mengerjakan lebih dari apa yang dibayar pada suatu saat akan dibayar lebih dari apa yang ia kerjakan",
    "Satu-satunya sumber pengetahuan adalah pengalaman",
    "Saya selalu mencoba untuk mengubah kemalangan menjadi kesempatan",
    "Perjalanan 1000 mil dimulai dengan satu langkah kaki",
    "Seseorang yang pernah melakukan kesalahan dan tidak pernah memperbaikinya berarti Ia telah melakukan satu kesalahan lagi.",
    "Beberapa orang memimpikan kesuksesannya, sementara yang lainnya bangun setiap pagi untuk mewujudkan mimpinya",
    "Tidak ada perjuangan yang dilakukan tanpa rasa sakit, namun Anda harus percaya bahwa rasa sakit itu hanya sesaat saja dan akan diganti dengan kebahagiaan",
    "Anda seringkali lupa terhadap apa saja yang sudah dimiliki, tetapi selalu mengingat apa yang dimiliki orang lain",
    "Anda tidak akan pernah belajar sabar dan berani jika di dunia ini hanya ada kebahagiaan",
    "Maafkanlah sikap Anda ketika mengalami kegagalan dalam meraih mimpi dan percayalah akan ada mimpi lain yang lebih besar dan lebih baik dari mimpi Anda yang sudah dirancang sebelumnya",
    "Masa depan adalah milik Anda yang telah menyiapkannya dari hari ini",
    "Sekecil apapun nominalnya, uang akan cukup jika digunakan untuk HIDUP. Namun, sebesar apapun nominalnya, uang tidak akan pernah cukup jika digunakan untuk memenuhi GAYA HIDUP",
    "Kesabaran adalah obat terbaik untuk segala kesulitan",
    "Kedewasaan tidak dilihat dari usia, tetapi dilihat dari sikap dan tingkah laku",
    "Percaya diri adalah rahasia nomor satu dari kesuksesan",
    "Jika kapal Anda tidak kunjung datang maka berenanglah",
    "Kemanapun Anda pergi, lakukanlah segalanya dengan segenap hati.",
    "Bertambahnya usia bukan berarti kita memahami segalanya",
    "Keraguan membunuh lebih banyak harapan daripada kegagalan",
    "Siapapun bisa jadi apapun!",
    "Kata-kata Anda menunjukkan kualitas diri Anda",
    "Hati memiliki nalarnya sendiri, tetapi nalar tidak memiliki hati",
    "Majulah tanpa menyingkirkan orang lain. Naiklah tanpa menjatuhkan orang lain",
    "Pamer adalah ide yang bodoh untuk sebuah kemenangan",
    "Jika hanya mencari kesempurnaan, maka Anda tidak akan pernah tenang",
    "Hanya Saya yang dapat mengubah hidup Saya, tidak ada orang lain yang bisa melakukannya untuk Saya",
    "Bersyukurlah atas semua hal yang dimiliki sekarang karena Anda tidak pernah tahu kapan akan kehilangannya",
    'Hidup itu bukan tentang memiliki dan mendapatkan, tetapi tentang memberi serta menjadi "sesuatu"',
    "Jangan takut jika Anda berjalan lambat, takutlah jika hanya berdiam",
    "Terkadang Anda diuji bukan untuk menunjukkan kelemahan yang dimiliki, tetapi diuji untuk menemukan kekuatan yang ada di dalam diri",
    "Kita sibuk mencari yang sempurna, sampai-sampai melewatkan yang siap menerima apa adanya",
    "Beri nilai dari usahanya, bukan dari hasilnya. Baru Anda bisa menilai kehidupan",
  ];
  return (
    <div className="p-4 font-sans">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Anda mempunyai masalah? Bingung untuk curhat kepada siapa?
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        RucoTalk adalah platform obrolan bebas atau forum diskusi yang
        memungkinkan pengguna untuk berbagi masalah dan mencari solusi masalah
        yang sedang kalian alami. Kami akan merespon anda secepat mungkin dengan
        orang-orang yang berpengalaman di bidangnya dan dapat dipastikan mereka
        bukanlah robot atau AI.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Jangan pernah sesekali untuk menyimpan masalahmu sendiri yaa. Ceritakan
        saja :)
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Kami akan menjaga rahasiamu <em>lhoo..</em> ;) Jangan ragu-ragu lagi dan
        ceritakan semuanya agar dirimu bisa lebih <em>lega..</em>.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Ini ada kata-kata dari kami untuk kamu :)
      </p>
      <blockquote className="mt-6 border-l-2 pl-6 italic border-l-slate-700 text-muted-foreground">
        "{quotes[Math.floor(Math.random() * quotes.length)]}"
      </blockquote>
    </div>
  );
}

export default function Index() {
  const data = useLoaderData<{
    isLoggedIn: boolean;
    user: User;
    expired: number;
  }>();
  return data.isLoggedIn ? <Logged /> : <NotLogged />;
}
