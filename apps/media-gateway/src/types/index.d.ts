import "express-serve-static-core";

export { };

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            email: string;
            role: import("@prisma/client").UserRole; 
        };
    }
}
