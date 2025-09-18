-- CreateTable
CREATE TABLE "public"."Liga" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Liga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Equipo" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ligaId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_ligaId_nombre_key" ON "public"."Equipo"("ligaId", "nombre");

-- AddForeignKey
ALTER TABLE "public"."Equipo" ADD CONSTRAINT "Equipo_ligaId_fkey" FOREIGN KEY ("ligaId") REFERENCES "public"."Liga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
