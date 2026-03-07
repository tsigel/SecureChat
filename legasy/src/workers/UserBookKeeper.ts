export class UserBookKeeper {
    private readonly store: Record<PublicKey, UserBook> = Object.create(null);

    public updateUserBook(userId: PublicKey, userBook: UserBook): void {
        this.store[userId] = userBook;
    }

    public getName(userId: PublicKey, from: PublicKey): string | undefined {
        return this.store[userId]?.[from]?.name;
    }

}

export type PublicKey = string;
export type UserBook = Record<PublicKey, { name: string }>
