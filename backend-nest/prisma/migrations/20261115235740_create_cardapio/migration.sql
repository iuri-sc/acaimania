-- CreateTable
CREATE TABLE "copos" (
    "id" SERIAL NOT NULL,
    "tamanho" VARCHAR(20) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "copos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicionais" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "acompanhamento" BOOLEAN NOT NULL DEFAULT true,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "copos_tamanho_key" ON "copos"("tamanho");

-- CreateIndex
CREATE UNIQUE INDEX "adicionais_nome_key" ON "adicionais"("nome");
