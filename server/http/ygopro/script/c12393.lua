--The Fang of Critias
function c12393.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon proc
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c12393.spcon1)	
	c:RegisterEffect(e1)
	--spsummon2 proc
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c12393.spcon2)	
	c:RegisterEffect(e2)
	--spsummon3 proc
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_SPSUMMON_PROC)
	e3:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e3:SetRange(LOCATION_HAND)
	e3:SetCondition(c12393.spcon3)	
	c:RegisterEffect(e3)	
	--xyzlimit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_BE_XYZ_MATERIAL)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e3:SetValue(1)
	c:RegisterEffect(e3)
	--synchrolimit
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e4:SetValue(1)
	c:RegisterEffect(e4)
end

function c12393.spfilter1(c,code)
	return c:IsCode(code)
end

function c12393.spcon1(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE,0)~=0
		and Duel.IsExistingMatchingCard(c12393.spfilter1,tp,LOCATION_ONFIELD,0,1,nil,44095762)
end

function c12393.spfilter2(c,code)
	return c:IsCode(code)
end

function c12393.spcon2(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE,0)~=0
		and Duel.IsExistingMatchingCard(c12393.spfilter2,tp,LOCATION_ONFIELD,0,1,nil,35027493)
end


function c12393.spfilter3(c,code)
	return c:IsCode(code)
end

function c12393.spcon3(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE,0)~=0
		and Duel.IsExistingMatchingCard(c12393.spfilter3,tp,LOCATION_ONFIELD,0,1,nil,123110)
end
