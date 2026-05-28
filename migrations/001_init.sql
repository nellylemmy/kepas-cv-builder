CREATE TABLE public.cv_documents (
    id integer NOT NULL,
    share_code character varying(12) NOT NULL,
    cv_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    photo_data text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE SEQUENCE public.cv_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.cv_documents_id_seq OWNED BY public.cv_documents.id;
ALTER TABLE ONLY public.cv_documents ALTER COLUMN id SET DEFAULT nextval('public.cv_documents_id_seq'::regclass);
ALTER TABLE ONLY public.cv_documents
    ADD CONSTRAINT cv_documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cv_documents
    ADD CONSTRAINT cv_documents_share_code_key UNIQUE (share_code);
CREATE INDEX idx_cv_documents_share_code ON public.cv_documents USING btree (share_code);
CREATE INDEX idx_cv_documents_updated_at ON public.cv_documents USING btree (updated_at);
