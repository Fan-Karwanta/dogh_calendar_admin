import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { LogOut, Plus, Trash2, Edit3, Calendar, Clock, MapPin, X, Save, CalendarDays, Building2, ExternalLink, AlertCircle, Star, Download } from 'lucide-react'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [holidays, setHolidays] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showVenueForm, setShowVenueForm] = useState(false)
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingVenue, setEditingVenue] = useState(null)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [venueFormError, setVenueFormError] = useState('')
  const [holidayFormError, setHolidayFormError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    venue: ''
  })
  const [venueFormData, setVenueFormData] = useState({ name: '' })
  const [holidayFormData, setHolidayFormData] = useState({ name: '', date: '', type: 'regular', recurring: true })

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`, authHeaders)
      setEvents(res.data)
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    }
  }

  const fetchVenues = async () => {
    try {
      const res = await axios.get(`${API_URL}/venues`)
      setVenues(res.data)
    } catch (err) {
      console.error('Error fetching venues:', err)
    }
  }

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${API_URL}/holidays`, authHeaders)
      setHolidays(res.data)
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchVenues()
    fetchHolidays()
  }, [])

  const resetForm = () => {
    setFormData({ title: '', dateFrom: '', dateTo: '', timeFrom: '', timeTo: '', venue: '' })
    setEditingEvent(null)
    setShowForm(false)
    setFormError('')
  }

  const resetVenueForm = () => {
    setVenueFormData({ name: '' })
    setEditingVenue(null)
    setShowVenueForm(false)
    setVenueFormError('')
  }

  const resetHolidayForm = () => {
    setHolidayFormData({ name: '', date: '', type: 'regular', recurring: true })
    setEditingHoliday(null)
    setShowHolidayForm(false)
    setHolidayFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFormError('')

    try {
      if (editingEvent) {
        await axios.put(`${API_URL}/events/${editingEvent._id}`, formData, authHeaders)
      } else {
        await axios.post(`${API_URL}/events`, formData, authHeaders)
      }
      await fetchEvents()
      resetForm()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
      else if (err.response?.status === 409) {
        setFormError(err.response.data.message)
      } else {
        setFormError('An error occurred while saving the event.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVenueSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setVenueFormError('')

    try {
      if (editingVenue) {
        await axios.put(`${API_URL}/venues/${editingVenue._id}`, venueFormData, authHeaders)
      } else {
        await axios.post(`${API_URL}/venues`, venueFormData, authHeaders)
      }
      await fetchVenues()
      resetVenueForm()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
      else if (err.response?.status === 400) {
        setVenueFormError(err.response.data.message)
      } else {
        setVenueFormError('An error occurred while saving the venue.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleHolidaySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setHolidayFormError('')

    try {
      if (editingHoliday) {
        await axios.put(`${API_URL}/holidays/${editingHoliday._id}`, holidayFormData, authHeaders)
      } else {
        await axios.post(`${API_URL}/holidays`, holidayFormData, authHeaders)
      }
      await fetchHolidays()
      resetHolidayForm()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
      else {
        setHolidayFormError(err.response?.data?.message || 'An error occurred while saving the holiday.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSeedHolidays = async () => {
    if (!window.confirm('This will seed default Philippine holidays. Continue?')) return
    setLoading(true)
    try {
      await axios.post(`${API_URL}/holidays/seed`, {}, authHeaders)
      await fetchHolidays()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
      else alert(err.response?.data?.message || 'Error seeding holidays')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAllHolidays = async () => {
    if (!window.confirm('Are you sure you want to delete ALL holidays? This cannot be undone.')) return
    setLoading(true)
    try {
      await axios.delete(`${API_URL}/holidays`, authHeaders)
      await fetchHolidays()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    const fromDate = new Date(event.dateFrom)
    const toDate = new Date(event.dateTo)
    const fmtDate = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    setFormData({
      title: event.title,
      dateFrom: fmtDate(fromDate),
      dateTo: fmtDate(toDate),
      timeFrom: event.timeFrom,
      timeTo: event.timeTo,
      venue: event.venue
    })
    setEditingEvent(event)
    setShowForm(true)
    setFormError('')
  }

  const handleEditVenue = (venue) => {
    setVenueFormData({ name: venue.name })
    setEditingVenue(venue)
    setShowVenueForm(true)
    setVenueFormError('')
  }

  const handleEditHoliday = (holiday) => {
    const hDate = new Date(holiday.date)
    const y = hDate.getFullYear()
    const m = String(hDate.getMonth() + 1).padStart(2, '0')
    const d = String(hDate.getDate()).padStart(2, '0')
    setHolidayFormData({
      name: holiday.name,
      date: `${y}-${m}-${d}`,
      type: holiday.type,
      recurring: holiday.recurring
    })
    setEditingHoliday(holiday)
    setShowHolidayForm(true)
    setHolidayFormError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await axios.delete(`${API_URL}/events/${id}`, authHeaders)
      await fetchEvents()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    }
  }

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return
    try {
      await axios.delete(`${API_URL}/venues/${id}`, authHeaders)
      await fetchVenues()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    }
  }

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return
    try {
      await axios.delete(`${API_URL}/holidays/${id}`, authHeaders)
      await fetchHolidays()
    } catch (err) {
      if (err.response?.status === 401) onLogout()
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = (event) => {
    const from = new Date(event.dateFrom)
    const to = new Date(event.dateTo)
    if (from.toDateString() === to.toDateString()) {
      return formatDate(event.dateFrom)
    }
    return `${formatDate(event.dateFrom)} — ${formatDate(event.dateTo)}`
  }

  const groupedEvents = events.reduce((groups, event) => {
    const date = new Date(event.dateFrom)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!groups[key]) groups[key] = { label, events: [] }
    groups[key].events.push(event)
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dogh-primary rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">DOGH Admin Panel</h1>
              <p className="text-xs text-slate-500">Calendar Event Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://dogh-room-admin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl transition-all border border-emerald-200"
            >
              <ExternalLink className="w-4 h-4" />
              Room Admin
            </a>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-dogh-primary text-white shadow-md shadow-cyan-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Events
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'venues'
                ? 'bg-dogh-primary text-white shadow-md shadow-cyan-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Venues
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'holidays'
                ? 'bg-dogh-primary text-white shadow-md shadow-cyan-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4" />
            Holidays
          </button>
        </div>

        {/* ==================== EVENTS TAB ==================== */}
        {activeTab === 'events' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-dogh-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{events.length}</p>
                    <p className="text-sm text-slate-500">Total Events</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {events.filter(e => new Date(e.dateTo || e.dateFrom) >= new Date(new Date().setHours(0,0,0,0))).length}
                    </p>
                    <p className="text-sm text-slate-500">Upcoming Events</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{venues.length}</p>
                    <p className="text-sm text-slate-500">Registered Venues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Events Yet</h3>
                <p className="text-slate-500 mb-6">Create your first event to get started.</p>
                <button
                  onClick={() => { resetForm(); setShowForm(true) }}
                  className="px-6 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all"
                >
                  Create Event
                </button>
              </div>
            ) : (
              Object.entries(groupedEvents)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, group]) => (
                  <div key={key} className="mb-8">
                    <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-dogh-primary" />
                      {group.label}
                    </h2>
                    <div className="space-y-3">
                      {group.events.map((event) => (
                        <div
                          key={event._id}
                          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-slate-800 mb-2">
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-dogh-primary" />
                                  {formatDateRange(event)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-dogh-primary" />
                                  {event.timeFrom} - {event.timeTo}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-dogh-primary" />
                                  {event.venue}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(event)}
                                className="p-2 hover:bg-cyan-50 text-dogh-primary rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(event._id)}
                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </>
        )}

        {/* ==================== VENUES TAB ==================== */}
        {activeTab === 'venues' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Venue Management</h2>
                <p className="text-sm text-slate-500 mt-1">Manage standard venues for calendar events</p>
              </div>
              <button
                onClick={() => { resetVenueForm(); setShowVenueForm(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Venue
              </button>
            </div>

            {venues.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Venues Yet</h3>
                <p className="text-slate-500 mb-6">Add your first venue to standardize event locations.</p>
                <button
                  onClick={() => { resetVenueForm(); setShowVenueForm(true) }}
                  className="px-6 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all"
                >
                  Add Venue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-dogh-primary" />
                        </div>
                        <h3 className="font-semibold text-slate-800">{venue.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditVenue(venue)}
                          className="p-2 hover:bg-cyan-50 text-dogh-primary rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(venue._id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================== HOLIDAYS TAB ==================== */}
        {activeTab === 'holidays' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Holiday Management</h2>
                <p className="text-sm text-slate-500 mt-1">Manage holidays displayed on the public calendar</p>
              </div>
              <div className="flex items-center gap-2">
                {holidays.length === 0 && (
                  <button
                    onClick={handleSeedHolidays}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-xl transition-all border border-amber-200 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Seed PH Holidays
                  </button>
                )}
                {holidays.length > 0 && (
                  <button
                    onClick={handleClearAllHolidays}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all border border-red-200 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => { resetHolidayForm(); setShowHolidayForm(true) }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Holiday
                </button>
              </div>
            </div>

            {/* Holiday Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{holidays.length}</p>
                    <p className="text-sm text-slate-500">Total Holidays</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {holidays.filter(h => h.type === 'regular').length}
                    </p>
                    <p className="text-sm text-slate-500">Regular Holidays</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {holidays.filter(h => h.type === 'special').length}
                    </p>
                    <p className="text-sm text-slate-500">Special Holidays</p>
                  </div>
                </div>
              </div>
            </div>

            {holidays.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Holidays Yet</h3>
                <p className="text-slate-500 mb-6">Seed Philippine holidays or add holidays manually.</p>
                <button
                  onClick={handleSeedHolidays}
                  disabled={loading}
                  className="px-6 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  Seed Philippine Holidays
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.map((holiday) => (
                  <div
                    key={holiday._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-slate-800">
                            {holiday.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            holiday.type === 'regular'
                              ? 'bg-red-100 text-red-700'
                              : holiday.type === 'special'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {holiday.type === 'regular' ? 'Regular' : holiday.type === 'special' ? 'Special' : 'Observance'}
                          </span>
                          {holiday.recurring && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Recurring
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-red-500" />
                            {formatDate(holiday.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditHoliday(holiday)}
                          className="p-2 hover:bg-cyan-50 text-dogh-primary rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(holiday._id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                  placeholder="e.g., Monthly Staff Meeting"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date From</label>
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => {
                      const newDateFrom = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        dateFrom: newDateFrom,
                        dateTo: prev.dateTo && prev.dateTo < newDateFrom ? newDateFrom : prev.dateTo
                      }))
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date To</label>
                  <input
                    type="date"
                    value={formData.dateTo}
                    min={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time From</label>
                  <input
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time To</label>
                  <input
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                For multi-day events, the time range applies to each day of the event.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue</label>
                {venues.length > 0 ? (
                  <select
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800 bg-white"
                    required
                  >
                    <option value="">Select a venue</option>
                    {venues.map((v) => (
                      <option key={v._id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    No venues available. Please add venues first in the Venues tab.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || venues.length === 0}
                  className="flex-1 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Venue Form Modal */}
      {showVenueForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h2>
              <button
                onClick={resetVenueForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleVenueSubmit} className="p-6 space-y-5">
              {venueFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{venueFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue Name</label>
                <input
                  type="text"
                  value={venueFormData.name}
                  onChange={(e) => setVenueFormData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                  placeholder="e.g., Conference Room A"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetVenueForm}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingVenue ? 'Update Venue' : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Form Modal */}
      {showHolidayForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
              <button
                onClick={resetHolidayForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-5">
              {holidayFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{holidayFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Holiday Name</label>
                <input
                  type="text"
                  value={holidayFormData.name}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                  placeholder="e.g., Christmas Day"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={holidayFormData.date}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select
                  value={holidayFormData.type}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-dogh-primary/30 focus:border-dogh-primary transition-all text-slate-800 bg-white"
                >
                  <option value="regular">Regular Holiday</option>
                  <option value="special">Special Non-Working Holiday</option>
                  <option value="observance">Observance</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={holidayFormData.recurring}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, recurring: e.target.checked })}
                  className="w-4 h-4 text-dogh-primary border-slate-300 rounded focus:ring-dogh-primary/30"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-slate-700">
                  Recurring yearly
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetHolidayForm}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-dogh-primary hover:bg-dogh-secondary text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
