import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { FilePen, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Thread } from "~/types/Thread";
import { DB } from "~/lib/.server/db.server";
import { LoginCookie, User } from "~/types";
import { redirect } from "@remix-run/node";
// import { Session } from "~/lib/.server/sessions";
import { login } from "~/lib/.server/cookies";
import { getSession } from "~/lib/.server/sessions";
import { Account, Users as AppUsers, Query } from "node-appwrite";
import { adminClient } from "~/lib/.server/appwrite";

type ThreadWithAuthor = Thread & { author: User };

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie:
    | LoginCookie
    | {
        isLoggedIn: false;
      } = (await login.parse(cookieHeader)) ?? {
    isLoggedIn: false,
  };
  // const { getSession } = await Session;
  const session = await getSession(cookieHeader);
  const token = session.get("secret");
  if (!token) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const threads = (await fetch(`${url.origin}/api/threads/list`, {
    headers: {
      Authorization: `Bearer ${process.env.REFRESH_SECRET}`,
    },
  }).then((res) => res.json())) as ThreadWithAuthor[];
  const account = new Account(adminClient);
  const isLoggedIn = (await account.get()) ? true : false;
  const user = await account.get();

  const db = new DB();
  const users = new AppUsers(adminClient);
  const admins = (await users.list([Query.contains("labels", "admin")])).users;

  if (isLoggedIn) {
    if (!user.labels.includes("admin")) {
      return redirect("/");
    }
  }

  await Promise.all(
    threads.map(async (thread) => {
      const user = await db.getUser({ id: thread.authorId });
      thread.author = user!;

      return thread;
    })
  );

  const usersTotal = (await users.list()).total;

  return json(
    {
      threads,
      user,
      admins,
      usersTotal,
    },
    200
  );
}

function getAvatarFallback(username: string | null) {
  return username === "" || !username
    ? "U"
    : username
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase())
        .join("");
}

export default function Dashboard() {
  const { threads, user, admins, usersTotal } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main className="flex flex-col flex-1 gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{usersTotal}</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Threads</CardTitle>
              <FilePen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{threads.length}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Threads</CardTitle>
                <CardDescription>Semua Threads ada disini.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-center">Tanggal</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread) => {
                    const date = new Date(thread.createdAt!);
                    const fullDate = `${date
                      .getDate()
                      .toString()
                      .padStart(2, "0")}-${(date.getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}-${date.getFullYear()}`;

                    return (
                      <TableRow key={thread.id}>
                        <TableCell>
                          <Link
                            to={`/threads/${thread.id}`}
                            className="hover:text-primary/45"
                          >
                            {thread.title}
                          </Link>
                          <span className="text-sm text-muted-foreground leading-6 block max-w-32 truncate">
                            {thread.author?.username}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {fullDate}
                        </TableCell>
                        <TableCell className="text-right">
                          {thread.status === "open" ? (
                            <Badge variant="success">Buka</Badge>
                          ) : (
                            <Badge variant="secondary">Tutup</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Admins</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              {admins.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada admin.
                </p>
              ) : (
                admins.map((admin) => {
                  return (
                    <div key={admin["$id"]} className="flex items-center gap-4">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src="" alt="Avatar" />
                        <AvatarFallback>
                          {getAvatarFallback(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {admin.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
