--Scripted by Eerie Code
--Light Guidance
function c6960.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c6960.condition)
	e1:SetTarget(c6960.target)
	e1:SetOperation(c6960.operation)
	c:RegisterEffect(e1)
	--Banish
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
	e2:SetCode(EVENT_LEAVE_FIELD)
	e2:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e2:SetOperation(c6960.desop)
	c:RegisterEffect(e2)
end

function c6960.cfil1(c)
	return c:IsFaceup() and c:IsCode(6960)
end
function c6960.condition(e,tp,eg,ep,ev,re,r,rp)
	return not Duel.IsExistingMatchingCard(c6960.cfil1,tp,LOCATION_ONFIELD,0,1,nil) and Duel.GetMatchingGroupCount(Card.IsSetCard,tp,LOCATION_GRAVE,0,nil,0xe0)>=3
end
function c6960.spfilter(c,e,tp)
	return c:IsSetCard(0xe0) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c6960.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c6960.spfilter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c6960.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c6960.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c6960.eqlimit(e,c)
	return e:GetLabelObject()==c
end
function c6960.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) then
		if Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)==0 then return end
		Duel.Equip(tp,c,tc)
		--Add Equip limit
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_EQUIP_LIMIT)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(c6960.eqlimit)
		e1:SetLabelObject(tc)
		c:RegisterEffect(e1)
		--Disable
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_EQUIP)
		e2:SetCode(EFFECT_DISABLE)
		c:RegisterEffect(e2)
		--cannot attack announce
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_FIELD)
		e3:SetRange(LOCATION_SZONE)
		e3:SetCode(EFFECT_CANNOT_ATTACK)
		e3:SetTargetRange(LOCATION_MZONE,0)
		e3:SetTarget(c6960.antarget)
		c:RegisterEffect(e3)
		local e4=Effect.CreateEffect(c)
		e4:SetType(EFFECT_TYPE_EQUIP)
		e4:SetCode(EFFECT_EXTRA_ATTACK)
		e4:SetCondition(c6960.atkcon)
		e4:SetValue(c6960.atkval)
		c:RegisterEffect(e4)
	end
end
function c6960.antarget(e,c)
	return c~=e:GetHandler():GetEquipTarget()
end
function c6960.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(Card.IsSetCard,tp,LOCATION_GRAVE,0,1,nil,0xe0)
end
function c6960.atkval(e,c)
	return Duel.GetMatchingGroupCount(Card.IsSetCard,e:GetControler(),LOCATION_GRAVE,0,nil,0xe0)-1
end

function c6960.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=c:GetFirstCardTarget()
	if tc and tc:IsLocation(LOCATION_MZONE) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end
