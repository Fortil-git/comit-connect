-- CreateEnum
CREATE TYPE "ComiteStatus" AS ENUM ('ACTIVE', 'CLOSED', 'FUTURE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ACTION_CREATED', 'ACTION_UPDATED', 'ACTION_DELETED', 'VOTE_CREATED', 'VOTE_DELETED', 'SUJET_CREATED', 'SUJET_DELETED', 'NOTE_SAVED');

-- CreateEnum
CREATE TYPE "ActionStatut" AS ENUM ('EN_COURS', 'TERMINEE', 'ABANDONNEE');

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comites" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "entite" TEXT NOT NULL,
    "participants" TEXT NOT NULL DEFAULT '',
    "agence_invites" TEXT,
    "femmes" INTEGER NOT NULL DEFAULT 0,
    "hommes" INTEGER NOT NULL DEFAULT 0,
    "postes" TEXT[],
    "ordre_jour" TEXT NOT NULL DEFAULT '',
    "invites" TEXT,
    "form_data" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ComiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "agency_id" TEXT,

    CONSTRAINT "comites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "details" JSONB,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "theme_name" TEXT NOT NULL,
    "sub_theme_id" TEXT,
    "sub_theme_name" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "responsables" TEXT NOT NULL DEFAULT '',
    "echeance" TIMESTAMP(3) NOT NULL,
    "statut" "ActionStatut" NOT NULL DEFAULT 'EN_COURS',
    "commentaire_abandon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comite_id" TEXT,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_questions" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT,
    "theme_id" TEXT NOT NULL,
    "sub_theme_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_participants" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_options" (
    "id" TEXT NOT NULL,
    "vote_question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT,
    "theme_id" TEXT NOT NULL,
    "sub_theme_id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autres_sujets" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autres_sujets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_history" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT NOT NULL,
    "comite_date" TIMESTAMP(3) NOT NULL,
    "comite_entite" TEXT NOT NULL,
    "exported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_name" TEXT NOT NULL,

    CONSTRAINT "export_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notes_comite_id_theme_id_sub_theme_id_key" ON "notes"("comite_id", "theme_id", "sub_theme_id");

-- AddForeignKey
ALTER TABLE "comites" ADD CONSTRAINT "comites_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_questions" ADD CONSTRAINT "vote_questions_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_vote_question_id_fkey" FOREIGN KEY ("vote_question_id") REFERENCES "vote_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autres_sujets" ADD CONSTRAINT "autres_sujets_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
