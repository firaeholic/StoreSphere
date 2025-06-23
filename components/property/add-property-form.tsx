"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

const AMENITIES = [
  "WiFi",
  "Parking",
  "Kitchen",
  "Washer",
  "Dryer",
  "Air Conditioning",
  "Heating",
  "TV",
  "Coffee Maker",
  "Dishwasher",
  "Microwave",
  "Refrigerator",
  "Pool",
  "Hot Tub",
  "Gym",
  "Balcony",
  "Garden",
  "Fireplace",
  "Workspace",
  "Pet Friendly"
]

export function AddPropertyForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: [] as string[],
    images: [] as string[]
  })
  const [newImage, setNewImage] = useState("")

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }))
    }
  }

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage("")
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.location || !formData.price || !formData.bedrooms || !formData.bathrooms || !formData.maxGuests) {
      toast.error("Please fill in all required fields")
      return
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    if (parseInt(formData.bedrooms) <= 0 || parseInt(formData.bathrooms) <= 0 || parseInt(formData.maxGuests) <= 0) {
      toast.error("Bedrooms, bathrooms, and max guests must be greater than 0")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          location: formData.location,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          maxGuests: parseInt(formData.maxGuests),
          amenities: formData.amenities,
          images: formData.images
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create property')
      }

      const property = await response.json()
      toast.success("Property added successfully!")
      router.push(`/property/${property.id}`)
    } catch (error) {
      console.error('Property creation error:', error)
      toast.error("Failed to add property. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Tell us about your property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Cozy Downtown Apartment"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., New York, NY"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your property, its features, and what makes it special..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Provide details about your property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Night ($) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                placeholder="150"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange('bathrooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests *</Label>
              <Select value={formData.maxGuests} onValueChange={(value) => handleInputChange('maxGuests', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>
            Select all amenities available at your property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                />
                <Label htmlFor={amenity} className="text-sm font-normal">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Property Images</CardTitle>
          <CardDescription>
            Add images to showcase your property (URLs only for now)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Image */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />
            <Button type="button" onClick={addImage} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Image List */}
          {formData.images.length > 0 && (
            <div className="space-y-2">
              <Label>Added Images ({formData.images.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Invalid image URL
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.images.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No images added yet</p>
              <p className="text-sm text-gray-400">Add image URLs above to showcase your property</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Property...
            </>
          ) : (
            "Add Property"
          )}
        </Button>
      </div>
    </form>
  )
}