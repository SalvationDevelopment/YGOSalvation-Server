--ドラグニティの神槍
function c80100262.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c80100262.target)
	e1:SetOperation(c80100262.operation)
	c:RegisterEffect(e1)
	--Atk up
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_EQUIP)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetValue(c80100262.atkval)
	c:RegisterEffect(e2)
	--Equip limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_EQUIP_LIMIT)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetValue(c80100262.eqlimit)
	c:RegisterEffect(e3)
	--immune
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_EQUIP)
	e4:SetCode(EFFECT_IMMUNE_EFFECT)
	e4:SetValue(c80100262.efilter)
	c:RegisterEffect(e4)
	--equip
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(80100262,0))
	e5:SetCategory(CATEGORY_EQUIP)
	e5:SetType(EFFECT_TYPE_IGNITION)
	e5:SetRange(LOCATION_SZONE)
	e5:SetCountLimit(1,80100262)
	e5:SetTarget(c80100262.eqtg)
	e5:SetOperation(c80100262.eqop)
	c:RegisterEffect(e5)
end
function c80100262.eqlimit(e,c)
	return c:IsSetCard(0x29)
end
function c80100262.tglimit(e,re,rp)
	return rp~=e:GetHandlerPlayer() and re:IsActiveType(TYPE_TRAP+TYPE_MONSTER)
end
function c80100262.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x29)
end
function c80100262.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_MZONE and c80100262.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100262.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	Duel.SelectTarget(tp,c80100262.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c80100262.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Equip(tp,c,tc)
	end
end
function c80100262.atkval(e,c)
	return c:GetLevel()*100
end
function c80100262.efilter(e,re)
	return re:IsActiveType(TYPE_TRAP)
end
function c80100262.eqfilter(c,ec)
	return c:IsType(TYPE_TUNER) and c:IsSetCard(0x29) and c:IsRace(RACE_DRAGON) 
end
function c80100262.eqtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingMatchingCard(c80100262.eqfilter,tp,LOCATION_DECK,0,1,nil,e:GetHandler()) end
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,nil,1,tp,LOCATION_DECK)
end
function c80100262.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler():GetEquipTarget()
	if Duel.GetLocationCount(tp,LOCATION_SZONE)<=0 or not c or c:IsFacedown() or not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectMatchingCard(tp,c80100262.eqfilter,tp,LOCATION_DECK,0,1,1,nil,c)
	if g:GetCount()>0 then
		if not Duel.Equip(tp,g:GetFirst(),c,true) then return end
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_OWNER_RELATE)
		e1:SetCode(EFFECT_EQUIP_LIMIT)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(c80100262.eqlimit1)
		g:GetFirst():RegisterEffect(e1)
	end
end
function c80100262.eqlimit1(e,c)
	return e:GetOwner()==c
end
