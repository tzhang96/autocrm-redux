-- Enable the vector extension
create extension if not exists vector;

-- Create the embeddings table
create table if not exists document_embeddings (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
    metadata jsonb not null default '{}'::jsonb,
    chunk_start integer not null,
    chunk_end integer not null,
    file_path text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create an index for similarity search
create index if not exists document_embeddings_embedding_idx 
on document_embeddings 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create indexes for metadata search
create index if not exists document_embeddings_metadata_idx 
on document_embeddings 
using gin (metadata);

create index if not exists document_embeddings_file_path_idx 
on document_embeddings(file_path);

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_document_embeddings_updated_at
    before update on document_embeddings
    for each row
    execute function update_updated_at_column(); 