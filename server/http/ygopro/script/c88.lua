--No.88 Gimmick Pupept Destiny Leon
function c88.initial_effect(c)
	c:EnableCounterPermit(0x302b)
	--xyz summon
	aux.AddXyzProcedure(c,nil,8,3)
	c:EnableReviveLimit()
	--counter
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_COUNTER)
	e1:SetDescription(aux.Stringid(88,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c88.target)
	e1:SetOperation(c88.operation)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(c88.indes)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e3:SetValue(c88.indval)
	c:RegisterEffect(e3)
end
function c88.filter(c)
	return c:GetSequence()~=5
end


function c88.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT)
		and e:GetHandler():IsCanAddCounter(0x302b,1) end
	Duel.SetOperationInfo(0,CATEGORY_COUNTER,nil,1,0,0x302b)
end
function c88.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() and c:RemoveOverlayCard(tp,1,1,REASON_EFFECT) then
		c:AddCounter(0x302b,1)
		if c:GetCounter(0x302b)==3 then
			local WIN_REASON_DESTINY_LEO=0x17
			Duel.Win(c:GetControler(),WIN_REASON_DESTINY_LEO)
		end
	end
end

function c88.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c88.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end


