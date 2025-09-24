import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Search, Filter, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { motion } from "framer-motion";
import { AnimatedDropdown } from '../ui/AnimatedDropdown';
import { useCodeSystems } from '../../hooks/useApi';

export function NamasteCodes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Fetch NAMASTE code systems from API
  const { 
    data: codeSystemsResponse, 
    isLoading, 
    error 
  } = useCodeSystems({ 
    _summary: 'true',
    url: 'http://terminology.hl7.org/CodeSystem/namaste' 
  });

  // Transform API data to component format
  const namasteCodesData = React.useMemo(() => {
    if (!codeSystemsResponse?.data?.entry) return [];
    
    return codeSystemsResponse.data.entry.flatMap((entry: any) => {
      if (!entry.resource?.concept) return [];
      
      return entry.resource.concept.map((concept: any) => ({
        id: `${entry.resource.id || 'NAMASTE'}-${concept.code}`,
        code: concept.code,
        description: concept.display || concept.definition || 'No description available',
        category: entry.resource.title || 'NAMASTE',
        status: entry.resource.status === 'active' ? 'Active' : 
                 entry.resource.status === 'draft' ? 'Under Review' : 'Inactive',
        lastModified: entry.resource.date?.split('T')[0] || '2024-01-01',
        mappings: concept.property?.length || 0
      }));
    });
  }, [codeSystemsResponse]);

  // Extract unique categories for dropdown
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(namasteCodesData.map(item => item.category))];
    return ['All Categories', ...uniqueCategories];
  }, [namasteCodesData]);

  const filteredCodes = namasteCodesData.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || code.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Namaste Codes</h1>
          <p className="text-muted-foreground">
            Manage and browse Namaste medical classification codes
          </p>
        </div>
        <motion.button
          className="flex items-center space-x-2 btn btn-primary hover:bg-gray-200 rounded-md p-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Code</span>
        </motion.button>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search Box */}
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.02 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search codes, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </motion.div>

          {/* Category Select */}
          <AnimatedDropdown
            options={categories}
            selected={selectedCategory}
            onSelect={(val) => setSelectedCategory(val)}
          />




          {/* More Filters Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.08 }}
          >
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Codes", value: "12,847", color: "text-foreground" },
          { label: "Active", value: "11,234", color: "text-green-600" },
          { label: "Under Review", value: "892", color: "text-yellow-600" },
          { label: "Mapped", value: "8,456", color: "text-blue-600" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.04 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            NAMASTE Codes ({isLoading ? '...' : filteredCodes.length} results)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mappings</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading NAMASTE codes...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-600">
                      Failed to load codes. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No codes found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={code.description}>
                          {code.description}
                        </div>
                      </TableCell>
                      <TableCell>{code.category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(code.status)}>
                          {code.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{code.mappings}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.lastModified}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}