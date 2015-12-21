--Mirror Tablet
function c12314.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_BATTLE_DESTROYED)
	e1:SetCondition(c12314.condition)
	e1:SetTarget(c12314.target)
	e1:SetOperation(c12314.activate)
	c:RegisterEffect(e1)
	if not c12314.global_check then
		c12314.global_check=true
		local ge=Effect.CreateEffect(c)
		ge:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge:SetCode(EVENT_BATTLE_DESTROYING)
		ge:SetOperation(c12314.checkop)
		Duel.RegisterEffect(ge,0)
	end
end

function c12314.cfilter(c,tp)
	return c:GetPreviousControler()==tp
end
function c12314.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c12314.cfilter,1,nil,tp)
end

function c12314.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		if tc:IsFaceup() and tc:IsRelateToBattle() then
			tc:RegisterFlagEffect(12314,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_DAMAGE,0,1)
		end
		tc=eg:GetNext()
	end
end

function c12314.filter1(c)
	return c:IsFaceup() and c:GetFlagEffect(12314)~=0
end

function c12314.filter2(c)
	return c:IsPosition(POS_FACEUP_ATTACK)
end
function c12314.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.IsExistingTarget(c12314.filter1,tp,0,LOCATION_MZONE,1,nil)
		and Duel.IsExistingTarget(c12314.filter2,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(12314,0))
	local g1=Duel.SelectTarget(tp,c12314.filter1,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(12314,1))
	local g2=Duel.SelectTarget(tp,c12314.filter2,tp,LOCATION_MZONE,0,1,1,nil)
	e:SetLabelObject(g1:GetFirst())
end
function c12314.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc1=e:GetLabelObject()
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc2=g:GetFirst()
	if tc1==tc2 then tc2=g:GetNext() end
	if tc1:IsRelateToEffect(e) and tc1:IsFaceup() and tc2:IsRelateToEffect(e) and tc2:IsFaceup() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_BATTLE)
		e1:SetValue(tc1:GetAttack()/2)
		tc2:RegisterEffect(e1)
		local a=tc1
		local d=tc2
		if Duel.GetTurnPlayer()~=tp then
			a=tc1
			d=tc2
		end
		if a:IsPosition(POS_FACEUP_ATTACK) then
			Duel.CalculateDamage(a,d)
		end		
	end
end	