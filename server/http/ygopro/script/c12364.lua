--Machine Angel Ritual
function c12364.initial_effect(c)
	aux.AddRitualProcGreater(c,c12364.ritual_filter)
end
function c12364.ritual_filter(c)
	local code=c:GetCode()
	return code==12363 or code==12365 or code==12366
end
