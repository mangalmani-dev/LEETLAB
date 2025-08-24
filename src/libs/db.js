import {PrismaClient} from "../generated/prisma/index.js"; // this is a prisma client that help to talk with database


const globalForPrisma=globalThis;  // check that a global prisma is there so use them


export  const db=globalForPrisma.prisma||new PrismaClient()  //talk to db with globalforprisma or hire new prismaClient 


if(process.env.NODE_ENV=="production")globalForPrisma.prisma=db  // so in this we all ways keep the globally so more efficent work done