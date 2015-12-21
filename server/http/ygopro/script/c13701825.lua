--No.77: The Seven Sins
--By: HelixReactor
function c13701825.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,12,2,c13701825.ovfilter,aux.Stringid(13701825,1),2,c13701825.xyzop)
	c:EnableReviveLimit()
	--Remove
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_REMOVE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c13701825.rmcost)
	e1:SetTarget(c13701825.rmtg)
	e1:SetOperation(c13701825.rmop)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c13701825.reptg)
	c:RegisterEffect(e2)
end
c13701825.xyz_number=77
function c13701825.ovfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:IsAttribute(ATTRIBUTE_DARK) and (c:GetRank()==10 or c:GetRank()==11)
end
function c13701825.xyzop(e,tp,chk)
	if chk==0 then return true end
	e:GetHandler():RegisterFlagEffect(13701825,RESET_EVENT+0xfe0000+RESET_PHASE+PHASE_END,0,1)
end
function c13701825.rmcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:CheckRemoveOverlayCard(tp,2,REASON_COST) and c:GetFlagEffect(13701825)==0 end
	c:RemoveOverlayCard(tp,2,2,REASON_COST)
end
function c13701825.rmfilter(c)
	return c:IsType(TYPE_MONSTER) and bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)==SUMMON_TYPE_SPECIAL and c:IsAbleToRemove()
end
function c13701825.rmtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13701825.rmfilter,tp,0,LOCATION_ONFIELD,1,nil) end
	local ct=Duel.GetMatchingGroupCount(c13701825.rmfilter,tp,0,LOCATION_ONFIELD,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,0,nil,ct,0)
end
function c13701825.rmop(e,tp,eg,ep,ev,re,r,rp)
	local g1=Duel.GetMatchingGroup(c13701825.rmfilter,tp,0,LOCATION_ONFIELD,nil)
	local g2=Group.CreateGroup()
	local tg=g1:GetFirst()
	while tg do
		Duel.Remove(tg,POS_FACEUP,REASON_EFFECT)
		if tg:IsLocation(LOCATION_REMOVED) then g2:AddCard(tg) end
		tg=g1:GetNext()
	end
	if g2:GetCount()>0 then
		local tg2=g2:Select(tp,1,1,nil)
		Duel.Overlay(e:GetHandler(),tg2)
	end
end
function c13701825.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT) end
	if Duel.SelectYesNo(tp,aux.Stringid(13701825,0)) then
		e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_EFFECT)
		return true
	else return false end
end
