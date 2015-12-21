--Number 84: Pain Gainer
function c13701837.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,11,2,c13701837.ovfilter,aux.Stringid(72001827,1),2,nil)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_DEFENCE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetValue(c13701837.atkval)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_CHAINING)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c13701837.indcon)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetOperation(c13701837.regop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_CHAIN_SOLVED)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c13701837.damcon)
	e3:SetOperation(c13701837.damop)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetCost(c13701837.spcost)
	e4:SetTarget(c13701837.destg)
	e4:SetOperation(c13701837.desop)
	c:RegisterEffect(e4)
end
c13701837.xyz_number=84
function c13701837.ovfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:IsAttribute(ATTRIBUTE_DARK) and (c:GetRank()==10 or c:GetRank()==9) and c:GetOverlayCount()>1
end
function c13701837.atkval(e,c)
	local g=Duel.GetMatchingGroup(Card.IsFaceup,c:GetControler(),LOCATION_MZONE,0,nil)
	return g:GetSum(Card.GetRank)*300
end

function c13701837.indcon(e)
	return e:GetHandler():GetOverlayCount()>0
end
function c13701837.regop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(13701837,RESET_EVENT+0x1fc0000+RESET_CHAIN,0,1)
end
function c13701837.damcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return ep~=tp and  re:IsHasType(EFFECT_TYPE_ACTIVATE) and c:GetFlagEffect(13701837)~=0
end
function c13701837.damop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_CARD,0,13701837)
	Duel.Damage(1-tp,500,REASON_EFFECT)
end

function c13701837.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13701837.filter(c,def)
	return c:IsFaceup() and c:GetDefence()<def and c:IsDestructable()
end
function c13701837.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local def=e:GetHandler():GetDefence()
	if chk==0 then return Duel.IsExistingMatchingCard(c13701837.filter,tp,0,LOCATION_MZONE,1,nil,def) end
	local g=Duel.GetMatchingGroup(c13701837.filter,tp,0,LOCATION_MZONE,nil,def)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c13701837.desop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	local def=c:GetDefence()
	local g=Duel.GetMatchingGroup(c13701837.filter,tp,0,LOCATION_MZONE,nil,def)
	Duel.Destroy(g,REASON_EFFECT)
end

