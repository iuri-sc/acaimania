/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `funcionarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_nome_key" ON "funcionarios"("nome");
