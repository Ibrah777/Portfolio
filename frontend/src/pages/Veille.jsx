import React from 'react';
import { portfolioData } from '../mock';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Veille() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-7 h-7 text-salmon-500" />
            <h1 className="text-3xl font-bold text-slate-900">Veille Informationnelle</h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10">
            <h2 className="font-semibold text-slate-900 mb-3">Dispositifs mis en place</h2>
            <p className="text-slate-700 leading-relaxed">{portfolioData.veille.intro}</p>
          </div>

          <div className="space-y-6">
            {portfolioData.veille.themes.map((theme, idx) => (
              <Card key={idx} className="border-l-4 border-l-salmon-400 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-salmon-600">
                    Thème {idx + 1} — {theme.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-5">{theme.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {theme.sources.map((source, i) => (
                      <Badge key={i} variant="outline" className="border-salmon-300 text-salmon-700">{source}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
