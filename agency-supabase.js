const InspectAidSupabase = (() => {
  const config = window.InspectAidSupabaseConfig || {};
  const enabled = Boolean(config.url && config.anonKey);
  let clientPromise = null;

  async function client() {
    if (!enabled) return null;
    if (!clientPromise) {
      clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
        .then(({ createClient }) => createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        }));
    }
    return clientPromise;
  }

  async function getSession() {
    const supabase = await client();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  }

  async function listAgencyMemberships() {
    const supabase = await client();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("agency_users")
      .select("agency_id, role, status, agencies(slug, name)")
      .eq("status", "active");
    if (error) throw error;
    return data || [];
  }

  async function saveConfiguration(snapshot) {
    const supabase = await client();
    if (!supabase) return { remote: false };
    const payload = {
      agency_slug: snapshot.agencyId,
      snapshot,
      status: "draft"
    };
    const { data, error } = await supabase
      .from("agency_configuration_snapshots")
      .insert(payload)
      .select("id, created_at")
      .single();
    if (error) throw error;
    return { remote: true, data };
  }

  async function submitApplication({ agencyId, form, answers, portalSource = "public" }) {
    const supabase = await client();
    if (!supabase) return { remote: false };
    const { data, error } = await supabase
      .from("public_submissions")
      .insert({
        agency_slug: agencyId,
        form_key: form.id,
        form_title: form.title,
        record_type: "application",
        status: "submitted",
        source: portalSource,
        answers
      })
      .select("id, submitted_at")
      .single();
    if (error) throw error;
    return { remote: true, data };
  }

  async function submitComplaint({ agencyId, answers }) {
    const supabase = await client();
    if (!supabase) return { remote: false };
    const { data, error } = await supabase
      .from("public_submissions")
      .insert({
        agency_slug: agencyId,
        form_key: "public-complaint",
        form_title: "Public complaint",
        record_type: "complaint",
        status: "received",
        source: "public",
        answers
      })
      .select("id, created_at")
      .single();
    if (error) throw error;
    return { remote: true, data };
  }

  async function listSubmissions(agencyId, limit = 50) {
    const supabase = await client();
    if (!supabase) return { remote: false, data: [] };
    const { data, error } = await supabase
      .from("public_submissions")
      .select("id, agency_slug, form_key, form_title, record_type, status, source, answers, submitted_at, updated_at")
      .eq("agency_slug", agencyId)
      .order("submitted_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { remote: true, data: data || [] };
  }

  async function updateSubmissionStatus(id, status) {
    const supabase = await client();
    if (!supabase) return { remote: false };
    const { data, error } = await supabase
      .from("public_submissions")
      .update({ status })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();
    if (error) throw error;
    return { remote: true, data };
  }

  return {
    client,
    enabled,
    getSession,
    listSubmissions,
    listAgencyMemberships,
    saveConfiguration,
    submitApplication,
    submitComplaint,
    updateSubmissionStatus
  };
})();

window.InspectAidSupabase = InspectAidSupabase;
