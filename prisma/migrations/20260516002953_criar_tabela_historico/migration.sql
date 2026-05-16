-- CreateTable
CREATE TABLE "historico_conversas" (
    "id" SERIAL NOT NULL,
    "numeroPaciente" TEXT NOT NULL,
    "remetente" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_conversas_pkey" PRIMARY KEY ("id")
);
