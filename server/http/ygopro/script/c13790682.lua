--Traptrix Rafflesia HELL YEAH FIXED NYAN!
function c13790682.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,4,2)
	c:EnableReviveLimit()
	--Trap Immunity
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_IMMUNE_EFFECT)
	e1:SetCondition(c13790682.effcon)
	e1:SetValue(c13790682.efilter)
	c:RegisterEffect(e1)
	--indes
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetTarget(c13790682.indtg)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	c:RegisterEffect(e3)
	--cannot target
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e4:SetTarget(c13790682.etarget)
	e4:SetTargetRange(LOCATION_MZONE,0)
	e4:SetValue(aux.tgoval)
	c:RegisterEffect(e4)
	--Activate
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_QUICK_O)
	e5:SetCode(EVENT_FREE_CHAIN)
	e5:SetHintTiming(0x1e5,0x1e5)
	e5:SetCountLimit(1)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCost(c13790682.cost)
	e5:SetTarget(c13790682.target)
	e5:SetOperation(c13790682.operation)
	c:RegisterEffect(e5)
end

function c13790682.etarget(e,c)
	return c:IsSetCard(0x108a) and not c:IsCode(13790682)
end
function c13790682.effcon(e)
	return e:GetHandler():GetOverlayCount()>0
end
function c13790682.efilter(e,te)
	return te:IsActiveType(TYPE_TRAP)
end

function c13790682.indtg(e,c)
	return c:IsSetCard(0x108A) and not c:IsCode(13790682)
end

function c13790682.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST)
	and Duel.IsExistingMatchingCard(c13790682.filter,tp,LOCATION_DECK,0,1,nil)  end
	local g=Duel.SelectMatchingCard(tp,c13790682.filter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()==0 then return end
	local te=g:GetFirst():CheckActivateEffect(false,true,true)
	c13790682[Duel.GetCurrentChain()]=te
	Duel.SendtoGrave(g,REASON_EFFECT)
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13790682.filter(c)
	return c:GetType()==TYPE_TRAP and (c:IsSetCard(0x4c) or c:IsSetCard(0x89)) and c:CheckActivateEffect(false,true,false)~=nil
end
function c13790682.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local te=c13790682[Duel.GetCurrentChain()]
	if chkc then
		local tg=te:GetTarget()
		return tg(e,tp,eg,ep,ev,re,r,rp,0,true)
	end
	if chk==0 then return true end
	if not te then return end
	e:SetCategory(te:GetCategory())
	e:SetProperty(te:GetProperty())
	local tg=te:GetTarget()
	if tg then tg(e,tp,eg,ep,ev,re,r,rp,1) end
end
function c13790682.operation(e,tp,eg,ep,ev,re,r,rp)
	local te=c13790682[Duel.GetCurrentChain()]
	if not te then return end
	local op=te:GetOperation()
	if op then op(e,tp,eg,ep,ev,re,r,rp) end
end
